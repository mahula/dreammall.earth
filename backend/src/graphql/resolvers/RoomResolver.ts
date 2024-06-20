import { Resolver, Mutation, Query, Authorized, Ctx, Arg, Int } from 'type-graphql'
// eslint-disable-next-line import/named
import { v4 as uuidv4 } from 'uuid'

import { createMeeting, joinMeetingLink, getMeetings, MeetingInfo } from '#api/BBB'
import { Room, OpenRoom } from '#models/RoomModel'
import { prisma } from '#src/prisma'
import { Context } from '#src/server/context'

@Resolver()
export class RoomResolver {
  @Authorized()
  @Mutation(() => Room, { nullable: true })
  async createMyRoom(@Arg('name') name: string, @Ctx() context: Context): Promise<Room | null> {
    const { user } = context
    if (!user) return null
    if (user.meetingId) {
      const meeting = await prisma.meeting.findUnique({
        where: {
          id: user.meetingId,
        },
      })
      if (meeting) return new Room(meeting)
      else return null
    }

    let meetingID: string = uuidv4()
    while (
      await prisma.meeting.count({
        where: {
          meetingID,
        },
      })
    ) {
      meetingID = uuidv4()
    }

    const meeting = await prisma.meeting.create({
      data: {
        name,
        meetingID,
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { meetingId: meeting.id },
    })
    return meeting
  }

  @Authorized()
  @Query(() => String, { nullable: true })
  async joinMyRoom(@Ctx() context: Context): Promise<string | null> {
    const { user } = context
    if (!user) return null
    const meeting = await createMeeting({
      name: 'Dreammall Entwicklung',
      meetingID: 'Dreammall-Entwicklung',
    })
    if (!meeting) return null
    return joinMeetingLink({
      fullName: user.name,
      meetingID: 'Dreammall-Entwicklung',
      password: meeting.moderatorPW,
      // role: 'MODERATOR',
      // createTime: meeting.createTime.toString(),
      // userID: user.id.toString(),
    })
  }

  @Authorized()
  @Query(() => [OpenRoom])
  async openRooms(@Ctx() context: Context): Promise<OpenRoom[]> {
    const { user } = context
    if (!user) return []
    const meetings = await getMeetings()
    return meetings.map(
      (m: MeetingInfo) =>
        new OpenRoom(
          m,
          joinMeetingLink({
            fullName: user.name,
            meetingID: m.meetingID,
            password: '',
          }),
        ),
    )
  }

  @Query(() => String, { nullable: true })
  async joinRoom(
    @Arg('userName') userName: string,
    @Arg('roomId', () => Int) roomId: number,
  ): Promise<string> {
    const meeting = await prisma.meeting.findUnique({
      where: {
        id: roomId,
      },
    })
    if (!meeting) throw new Error('Room does not exist')
    return joinMeetingLink({
      fullName: userName,
      meetingID: meeting.meetingID,
      password: meeting.attendeePW ? meeting.attendeePW : '',
    })
  }

  /*
  @Query(() => Boolean)
  async test(): Promise<boolean> {
    try {
      const result = await createMeeting({
        name: 'My Meeting ßß',
        meetingID: 'xxx',
      })
      console.log(result)
      // const test = await getMeetings()
    } catch (err) {
      console.log(err)
      return false
    }
    return true
  }
  */
}
