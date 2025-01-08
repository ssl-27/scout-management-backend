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

@Injectable()
export class UserGeneralService {
  constructor(
    @InjectRepository(BaseUserEntity)
    @InjectRepository(Leader)
    @InjectRepository(Guardian)
    @InjectRepository(Scout)
    @InjectRepository(ScoutMember) //Might be better to separate particular scout sections
    private userRepository: Repository<BaseUserEntity>,
    private leaderRepository: Repository<Leader>,
    private guardianRepository: Repository<Guardian>,
    private scoutRepository: Repository<Scout>,
    private scoutMemberRepository: Repository<ScoutMember>,
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
      //create leader
      if(createUserDto.role === UserTypeEnum.LEADER) {
        const leader = this.leaderRepository.create(createUserDto.leaderDetails);
        await manager.save(leader);
      }

      //create guardian
      if(createUserDto.role === UserTypeEnum.GUARDIAN) {
        const guardian = this.guardianRepository.create(createUserDto.guardianDetails);
        await manager.save(guardian);
      }

      //create scout
      if(createUserDto.role === UserTypeEnum.MEMBER) {
        const scout = this.scoutRepository.create(createUserDto.memberDetails);
        await manager.save(scout);

        //create scout member
        const scoutMember = this.scoutMemberRepository.create(createUserDto.memberDetails.scoutSectionDetails);
        await manager.save(scoutMember);
      }

      return await manager.save(user);
    })
  }
}