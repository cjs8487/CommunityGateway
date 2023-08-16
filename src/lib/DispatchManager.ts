type RunFunction = () => void;

const DELAY_MS = 2000;

/**
 * A manager for functions that need to be dispatched at a later time. Once pended,
 * scheduled runs will be run after a set timeout, unless another run gets pended
 * with the same key, in which case the timer is refreshed. The primary use case is
 * to batch calls where the same result can be accomplished with one call that does
 * all the changes, rather than a call for each change to reach the final state. This
 * also works great for preventing issues with rate limits when working with external APIs
 *
 * It is not guaranteed that all pended runs will be dispatched before the process
 * terminates, and there is no protections to ensure all pended runs execute before
 * the eprocess ends.
 *
 * There are several requirements for functions to dispatch correctly from here
 *  - The function must be the same for every run of a given key
 *  - The function should be pure (no program side effects)
 *  - The function must be safe to have run multiple times per pend
 */
class DispatchManager {
    pendingRuns: Map<string, NodeJS.Timeout>;
    pendingFuncs: Map<string, RunFunction>;
    constructor() {
        this.pendingRuns = new Map();
        this.pendingFuncs = new Map();
    }

    createWrappedCall(key: string, run: RunFunction): RunFunction {
        return () => {
            run();
            this.pendingRuns.delete(key);
        };
    }

    pendRun(key: string, run: RunFunction) {
        if (this.pendingRuns.has(key)) {
            this.pendingRuns.get(key)?.refresh();
        } else {
            this.pendingRuns.set(
                key,
                setTimeout(this.createWrappedCall(key, run), DELAY_MS),
            );
        }
    }

    clearPendingRun(key: string) {
        clearTimeout(this.pendingRuns.get(key));
        this.pendingRuns.delete(key);
        this.pendingFuncs.delete(key);
    }

    clearAllPendingRuns() {
        this.pendingRuns.forEach((timeout) => clearTimeout(timeout));
        this.pendingRuns.clear();
    }

    refreshAll() {
        this.pendingRuns.forEach((timeout) => timeout.refresh());
    }

    runNow(key: string) {
        const func = this.pendingFuncs.get(key);
        this.clearPendingRun(key);
        if (func) {
            func();
        }
    }
}

export default DispatchManager;
