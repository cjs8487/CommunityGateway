import { Database } from 'better-sqlite3';
import { userManager } from '../System';
import { User } from './UserManager';

export type AsyncSubmission = {
    id: number;
    user: User;
    time: string;
    comment: string;
}

export type Async = {
    id: number;
    name: string;
    permalink: string;
    hash: string;
    creator: User;
    submissions: AsyncSubmission[];
}

type DBSubmission = {
    id: number;
    race: number;
    user: number;
    time: string;
    comment: string;
}

type DBAsync = {
    id: number;
    name: string;
    permalink: string;
    hash: string;
    creator: number;
}

export class AsyncManager {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    getAsyncList(): Async[] {
        const asyncs: DBAsync[] = this.db.prepare('select * from asyncs').all();
        return asyncs.map((async) => ({
            id: async.id,
            name: async.name,
            permalink: async.permalink,
            hash: async.hash,
            creator: userManager.getUser(async.creator),
            submissions: [],
        }));
    }

    getAsync(id: number): Async {
        const raceData: DBAsync = this.db.prepare('select * from asyncs where id=?').get(id);
        const submissions: DBSubmission[] = this.db.prepare('select * from async_submissions where race=?').all(id);

        return {
            id: raceData.id,
            name: raceData.name,
            permalink: raceData.permalink,
            hash: raceData.hash,
            creator: userManager.getUser(raceData.creator),
            submissions: submissions.map((submission) => ({
                id: submission.id,
                user: userManager.getUser(submission.user),
                time: submission.time,
                comment: submission.time,
            })),
        };
    }

    updateAsync(id: number, async: Partial<Async>) {
        this.db.prepare('');
    }

    deleteAsync(id: number) {
        this.db.prepare('delete from asyncs where id=?').run(id);
    }

    createAsync(name: string, permalink: string, hash: string, creator: User) {
        this.db
            .prepare('insert into asyncs (name, permalink, hash, creator) values (?, ?, ?, ?)')
            .run(name, permalink, hash, creator?.id);
    }

    getSubmissionsForAsync(id: number): AsyncSubmission[] {
        const submissions = this.db.prepare('select * from async_submissions where id=?').all(id);
        return submissions.map((submission) => ({
            id: submission.id,
            user: userManager.getUser(submission.user),
            time: submission.time,
            comment: submission.time,
        }));
    }

    createSubmission(asyncId: number, user: User, time: string, comment: string) {
        this.db
            .prepare('insert into async_submissions (race, user, time, comment) values (?, ?, ?, ?)')
            .run(asyncId, user?.id, time, comment);
    }

    deleteSubmission(id: number) {
        this.db.prepare('delete from async_submissions where id=?').run(id);
    }
}
