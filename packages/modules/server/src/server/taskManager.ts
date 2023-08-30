import type {
  ServerResponseTaskManager as IServerResponseTaskManager,
  ServerResponseTask,
} from '@tramvai/tokens-server-private';

export class ServerResponseTaskManager implements IServerResponseTaskManager {
  private tasks: ServerResponseTask[] = [];
  private processedTasks: Promise<any>[] = [];
  private status: 'idle' | 'running' | 'closed' = 'idle';

  push(task: ServerResponseTask) {
    if (this.status === 'closed') {
      return;
    }

    this.tasks.push(task);

    if (this.status === 'running') {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.status === 'closed') {
      return;
    }

    this.status = 'running';

    while (this.tasks.length > 0 && this.status === 'running') {
      const task = this.tasks.shift();

      this.processedTasks.push(task());
    }
  }

  closeQueue() {
    this.status = 'closed';

    return Promise.all(this.processedTasks);
  }
}
