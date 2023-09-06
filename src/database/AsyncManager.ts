import { Database } from 'better-sqlite3';
// eslint-disable-next-line import/no-cycle
import { userManager } from '../System';

export type DisplayUser = {
    username: string;
    avatar: string;
    discordId: string;
};

export type AsyncSubmission = {
    id: number;
    user: DisplayUser;
    time: string;
    comment: string;
};

export type Async = {
    id: number;
    name: string;
    permalink: string;
    hash: string;
    version: string;
    versionLink: string;
    creator: DisplayUser;
    submissions: AsyncSubmission[];
};

type DBSubmission = {
    id: number;
    race: number;
    user: number;
    time: string;
    comment: string;
};

type DBAsync = {
    id: number;
    name: string;
    permalink: string;
    hash: string;
    version: string;
    version_link: string;
    creator: number;
};

export class AsyncManager {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    getAsyncList(): Async[] {
        const asyncs: DBAsync[] = this.db.prepare('select * from asyncs').all();
        const submissions: DBSubmission[] = this.db
            .prepare('select * from async_submissions')
            .all();

        return asyncs.map((async) => {
            const creator = userManager.getUser(async.creator);
            return {
                id: async.id,
                name: async.name,
                permalink: async.permalink,
                hash: async.hash,
                version: async.version,
                versionLink: async.version_link,
                creator: {
                    discordId: creator.discordId,
                    username: creator.discordUsername,
                    avatar: creator.discordAvatar,
                },
                submissions: submissions
                    .filter((submission) => submission.race === async.id)
                    .map((submission) => {
                        const submitter = userManager.getUser(submission.user);
                        return {
                            id: submission.id,
                            user: {
                                discordId: submitter.discordId,
                                avatar: submitter.discordAvatar,
                                username: submitter.discordUsername,
                            },
                            time: submission.time,
                            comment: submission.comment,
                        };
                    }),
            };
        });
    }

    getAsync(id: number): Async {
        const raceData: DBAsync = this.db
            .prepare('select * from asyncs where id=?')
            .get(id);
        const submissions: DBSubmission[] = this.db
            .prepare('select * from async_submissions where race=?')
            .all(id);

        const creator = userManager.getUser(raceData.creator);
        return {
            id: raceData.id,
            name: raceData.name,
            permalink: raceData.permalink,
            hash: raceData.hash,
            version: raceData.version,
            versionLink: raceData.version_link,
            creator: {
                discordId: creator.discordId,
                username: creator.discordUsername,
                avatar: creator.discordAvatar,
            },
            submissions: submissions.map((submission) => {
                const submitter = userManager.getUser(submission.user);
                return {
                    id: submission.id,
                    user: {
                        discordId: submitter.discordId,
                        avatar: submitter.discordAvatar,
                        username: submitter.discordUsername,
                    },
                    time: submission.time,
                    comment: submission.comment,
                };
            }),
        };
    }

    updateAsync(id: number, async: Partial<Async>) {
        this.db
            .prepare(
                `
                update asyncs set
                    name=coalesce(?,name),
                    permalink=coalesce(?,permalink),
                    hash=coalesce(?,hash),
                    version=coalesce(?,version),
                    version_link=coalesce(?,version_link)
                where id=?`,
            )
            .run(
                async.name,
                async.permalink,
                async.hash,
                async.version,
                async.versionLink,
                id,
            );
    }

    deleteAsync(id: number) {
        this.db.prepare('delete from asyncs where id=?').run(id);
    }

    createAsync(
        name: string,
        permalink: string,
        hash: string,
        creator: number,
    ) {
        return this.db
            .prepare(
                'insert into asyncs (name, permalink, hash, creator) values (?, ?, ?, ?)',
            )
            .run(name, permalink, hash, creator).lastInsertRowid;
    }

    getSubmissionsForAsync(id: number): AsyncSubmission[] {
        const submissions = this.db
            .prepare('select * from async_submissions where id=?')
            .all(id);
        return submissions.map((submission) => {
            const user = userManager.getUser(submission.user);
            return {
                id: submission.id,
                user: {
                    discordId: user.discordId,
                    avatar: user.discordAvatar,
                    username: user.discordUsername,
                },
                time: submission.time,
                comment: submission.time,
            };
        });
    }

    createSubmission(
        asyncId: number,
        user: number,
        time: string,
        comment: string,
    ) {
        this.db
            .prepare(
                'insert into async_submissions (race, user, time, comment) values (?, ?, ?, ?)',
            )
            .run(asyncId, user, time, comment);
    }

    deleteSubmission(id: number) {
        return this.db
            .prepare('delete from async_submissions where id=?')
            .run(id).changes;
    }
}
