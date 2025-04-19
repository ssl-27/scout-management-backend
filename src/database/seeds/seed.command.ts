// import { Command, CommandRunner } from 'nest-commander';
// import { Seeder } from './seed';
//
// @Command({ name: 'seed', description: 'Seed database with sample data' })
// export class SeedCommand extends CommandRunner {
//   constructor(private readonly seeder: Seeder) {
//     super();
//   }
//
//   async run(): Promise<void> {
//     try {
//       console.log('Starting database seeding...');
//       await this.seeder.seed();
//       console.log('Database seeding completed successfully!');
//       process.exit(0);
//     } catch (error) {
//       console.error('Database seeding failed:', error);
//       process.exit(1);
//     }
//   }
// }