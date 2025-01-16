import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseUserEntity } from '../../../entities/base/base-user.entity';
import { Guardian } from '../../../entities/user-groups/guardian.entity';
import { Scout } from '../../../entities/user-groups/scout.entity';
import { ScoutMember } from '../../../entities/user-groups/scout/scout-member.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserGeneralDto } from '../dto/create-user-general.dto';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { Leader } from '../../../entities/user-groups/leader.entity';
import { MemberGuardian } from '../../../entities/user-groups/member-guardian.entity';

@Injectable()
export class UserGeneralService {
  constructor(
    @InjectRepository(BaseUserEntity)
    private userRepository: Repository<BaseUserEntity>,
    @InjectRepository(Leader)
    private leaderRepository: Repository<Leader>,
    @InjectRepository(Guardian)
    private guardianRepository: Repository<Guardian>,
    @InjectRepository(Scout)
    private scoutRepository: Repository<Scout>,
    @InjectRepository(ScoutMember) //Might be better to separate particular scout sections
    private scoutMemberRepository: Repository<ScoutMember>,
    @InjectRepository(MemberGuardian)
    private memberGuardianRepository: Repository<MemberGuardian>,
    private dataSource: DataSource
  ) {}

  // Create
  async create(createUserDto: CreateUserGeneralDto): Promise<BaseUserEntity> {
    //check for email uniqueness
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if(existingUser) {
      throw new ConflictException('Email already exists!');
    }

    //if email is unique, can create user
    const user = this.userRepository.create(createUserDto);
    return await this.dataSource.transaction(async (manager) => {
      const savedUser = await manager.save(user);

      //create user based on role
    switch (createUserDto.role) {
      case UserTypeEnum.LEADER:
        createUserDto.leaderDetails.id = user.id;
        const leader = this.leaderRepository.create(createUserDto.leaderDetails);
        await manager.save(leader);
        break;

      case UserTypeEnum.GUARDIAN:
        createUserDto.guardianDetails.id = user.id;
        const guardian = this.guardianRepository.create(
          createUserDto.guardianDetails,
        );
        const member = await this.scoutRepository.findOne({ where: { id: createUserDto.guardianDetails.memberId } });
        const relationship = this.memberGuardianRepository.create({
          guardian: guardian,
          scout: member,
          relationship: createUserDto.guardianDetails.relationship
        });
        await manager.save(guardian);
        await manager.save(relationship);

        break;

      case UserTypeEnum.MEMBER:
        createUserDto.memberDetails.id = user.id;
        const scout = this.scoutRepository.create(createUserDto.memberDetails);
        await manager.save(scout);

        createUserDto.memberDetails.scoutSectionDetails.id = user.id;
        //TODO: check the validity of PL/APL
        const scoutMember = this.scoutMemberRepository.create(createUserDto.memberDetails.scoutSectionDetails);
        await manager.save(scoutMember);
        break;

      default:
        throw new ConflictException('Invalid user role!');
    }

      return savedUser;
    })
  }

  async findAll(): Promise<BaseUserEntity[]> {
    return await this.userRepository.find();

  }

  async findOne(id1: string) {
    return await this.userRepository.findOne({ where: { id: id1 } });

  }

  async update(id1: string, createUserGeneralDto: Partial<CreateUserGeneralDto>) {

  }

  async remove(id1: string) {

  }

  async findMembers() {
    return await this.scoutMemberRepository.createQueryBuilder('scoutMember')
      .leftJoinAndSelect('scoutMember.id', 'scout')
      .leftJoinAndSelect('scout.id', 'baseUser')
      .getMany();
  }
}