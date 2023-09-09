import { userManager } from '../System';
import { Database } from './core/Database';

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
        const asyncs: DBAsync[] = this.db.all('select * from asyncs');
        const submissions: DBSubmission[] = this.db.all(
            'select * from async_submissions',
        );

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
        const raceData: DBAsync = this.db.get(
            'select * from asyncs where id=?',
            id,
        );
        const submissions: DBSubmission[] = this.db.all(
            'select * from async_submissions where race=?',
            id,
        );

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
        this.db.run(
            `
                update asyncs set
                    name=coalesce(?,name),
                    permalink=coalesce(?,permalink),
                    hash=coalesce(?,hash),
                    version=coalesce(?,version),
                    version_link=coalesce(?,version_link)
                where id=?`,
            async.name,
            async.permalink,
            async.hash,
            async.version,
            async.versionLink,
            id,
        );
    }

    deleteAsync(id: number) {
        this.db.run('delete from asyncs where id=?', id);
    }

    createAsync(
        name: string,
        permalink: string,
        hash: string,
        creator: number,
    ) {
        return this.db.run(
            'insert into asyncs (name, permalink, hash, creator) values (?, ?, ?, ?)',
            name,
            permalink,
            hash,
            creator,
        ).lastInsertRowid;
    }

    getSubmissionsForAsync(id: number): AsyncSubmission[] {
        const submissions = this.db.all<DBSubmission>(
            'select * from async_submissions where id=?',
            id,
        );
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
        this.db.run(
            'insert into async_submissions (race, user, time, comment) values (?, ?, ?, ?)',
            asyncId,
            user,
            time,
            comment,
        );
    }

    deleteSubmission(id: number) {
        return this.db.run('delete from async_submissions where id=?', id)
            .changes;
    }

    submissionBelongsToUser(id: number, user: number) {
        return (
            this.db.get<DBSubmission>(
                'select * from async_submissions where id=?',
                id,
            ).user === user
        );
    }
}
