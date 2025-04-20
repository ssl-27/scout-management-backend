import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ScoutMember } from '../../entities/user-groups/scout/scout-member.entity';
import { Attendance } from '../../entities/training/attendance.entity';
import { MeetingEntity } from '../../entities/training/meeting.entity';
import { WorkSubmission } from '../../entities/training/work-submission.entity';
import { MemberBadge } from '../../entities/badge/member-badge.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ScoutMember)
    private scoutMemberRepository: Repository<ScoutMember>,

    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,

    @InjectRepository(MeetingEntity)
    private meetingRepository: Repository<MeetingEntity>,

    @InjectRepository(WorkSubmission)
    private workSubmissionRepository: Repository<WorkSubmission>,

    @InjectRepository(MemberBadge)
    private memberBadgeRepository: Repository<MemberBadge>,
  ) {}

  async getLeaderStats(userId: string) {
    // Total members
    const totalMembers = await this.scoutMemberRepository.count();

    // Get the most recent meeting
    const latestMeeting = await this.meetingRepository.findOne({
      order: { meetingDateStart: 'DESC' },
      where:{}
    });

    let todayAttendance = 0;
    if (latestMeeting) {
      // Count attendance for latest meeting
      todayAttendance = await this.attendanceRepository.count({
        where: {
          meetingEntity: { id: latestMeeting.id },
          attendance: 'Present'
        }
      });
    }

    // Count pending badge approvals
    const pendingSubmissions = await this.workSubmissionRepository.count({
      where: { status: 'Pending' }
    });

    return {
      totalMembers,
      todayAttendance,
      pendingBadges: pendingSubmissions,
      latestMeeting: latestMeeting ? {
        id: latestMeeting.id,
        title: latestMeeting.title,
        date: latestMeeting.meetingDateStart
      } : null
    };
  }

  async getMemberStats(userId: string) {
    // Get member's attendance rate
    const allAttendances = await this.attendanceRepository.find({
      where: { scout: { id: userId } }
    });

    const totalMeetings = allAttendances.length;
    const attendedMeetings = allAttendances.filter(a => a.attendance === 'Present').length;
    const attendanceRate = totalMeetings > 0 ? Math.round((attendedMeetings / totalMeetings) * 100) : 0;

    // Get badge count
    const earnedBadges = await this.memberBadgeRepository.count({
      where: {
        scout: { id: userId },
        isApproved: true
      }
    });

    const totalBadges = await this.memberBadgeRepository.count({
      where: { scout: { id: userId } }
    });

    // Get next meeting
    const nextMeeting = await this.meetingRepository.findOne({
      where: { meetingDateStart: MoreThan(new Date()) },
      order: { meetingDateStart: 'ASC' }
    });

    return {
      attendanceRate,
      attendedMeetings,
      totalMeetings,
      earnedBadges,
      totalBadges,
      nextMeeting: nextMeeting ? {
        id: nextMeeting.id,
        title: nextMeeting.title,
        date: nextMeeting.meetingDateStart
      } : null
    };
  }

  async getRecentActivities(userId: string, userGroup: string) {
    const activities = [];

    // For leaders, show broader activities
    if (userGroup === 'LEADER') {
      // Get recent attendances
      const recentAttendances = await this.attendanceRepository.find({
        relations: ['scout', 'scout.id', 'scout.id.id','meetingEntity'],
        order: { createdAt: 'DESC' },
        take: 5
      });

      for (const attendance of recentAttendances) {
        activities.push({
          title: attendance.meetingEntity.title,
          subtitle: `${attendance.scout.id['id']['firstName']} ${attendance.scout.id['id']['lastName']} was marked ${attendance.attendance}`,
          time: this.getTimeAgo(attendance.createdAt),
          icon: 'how_to_reg'
        });
      }

      // Get recent badge submissions
      const recentSubmissions = await this.workSubmissionRepository.find({
        relations: ['scout', 'scout.id','requirement'],
        order: { createdAt: 'DESC' },
        take: 5
      });

      for (const submission of recentSubmissions) {
        activities.push({
          title: 'Badge Submission',
          subtitle: `${submission.scout.id['firstName']} ${submission.scout.id['lastName']} submitted work for ${submission.requirement.text}`,
          time: this.getTimeAgo(submission.createdAt),
          icon: 'assignment_turned_in'
        });
      }
    } else {
      // For members, show their own activities
      const userAttendances = await this.attendanceRepository.find({
        where: { scout: { id: userId } },
        relations: ['meetingEntity'],
        order: { createdAt: 'DESC' },
        take: 5
      });

      for (const attendance of userAttendances) {
        activities.push({
          title: attendance.meetingEntity.title,
          subtitle: `You were marked ${attendance.attendance}`,
          time: this.getTimeAgo(attendance.createdAt),
          icon: 'how_to_reg'
        });
      }

      // Get user's badge progress
      const userBadges = await this.memberBadgeRepository.find({
        where: { scout: { id: userId } },
        relations: ['badge'],
        order: { updatedAt: 'DESC' },
        take: 5
      });

      for (const badge of userBadges) {
        activities.push({
          title: badge.badge.title,
          subtitle: badge.isApproved
            ? 'Badge awarded'
            : `Progress: ${badge.progressPercentage.toFixed(0)}%`,
          time: this.getTimeAgo(badge.updatedAt),
          icon: 'military_tech'
        });
      }
    }

    // Sort activities by time
    activities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return activities.slice(0, 10); // Return top 10 activities
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  }
}