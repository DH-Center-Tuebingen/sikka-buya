export const PublicationStatus = {
    Draft: 'draft',
    Published: 'published',
    Scheduled: 'scheduled'
}

export const PublicationAction = {
    Publish: 'publish',
    Unpublish: 'unpublish',
    Schedule: 'schedule',
    Unschedule: 'unschedule',
    Reschedule: 'reschedule',
    Redate: 'redate'
}


export default class Publication {
    constructor(userTimestamp, pageTimestamp) {
        this.userTimestamp = userTimestamp;
        this.pageTimestamp = pageTimestamp;
    }

    get published() {
        return this.pageTimestamp > 0;
    }

    get status() {
        let status = PublicationStatus.Draft;
        if (this.pageTimestamp > 0) {
            if (this.pageTimestamp > new Date().getTime()) {
                status = PublicationStatus.Scheduled;
            } else {
                status = PublicationStatus.Published;
            }
        }
        return status;
    }

    get action() {
        let action
        if (this.published) {
            if (this.pageTimestamp > new Date().getTime()) {
                if (this.userTimestamp !== this.pageTimestamp) {
                    action = PublicationAction.Reschedule;
                } else {
                    action = PublicationAction.Unschedule;
                }
            } else {
                if (this.userTimestamp !== this.pageTimestamp) {
                    action = PublicationAction.Redate;
                } else {
                    action = PublicationAction.Unpublish;
                }
            }
        } else {
            if (this.userTimestamp > new Date().getTime()) {
                action = PublicationAction.Schedule;
            } else {
                action = PublicationAction.Publish;
            }
        }

        return action;
    }
}