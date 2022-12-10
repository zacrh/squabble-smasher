class ConcurrentTaskQueue {
  constructor(taskPromisesFunc = [], batchSize = 1) {
    this.batchSize = batchSize > taskPromisesFunc.length ? taskPromisesFunc.length : batchSize
    this.todoTasks = taskPromisesFunc
    this.resolvedValues = []
  }

  run(resolve, reject) {
    if (this.todoTasks.length > 0) {
      const taskPromises = this.todoTasks.splice(0, this.batchSize);
      Promise.all(taskPromises.map((p) => p()))
        .then((resolvedValues) => {
          this.resolvedValues = [...this.resolvedValues, ...resolvedValues]
          this.run(resolve, reject)
        })
        .catch((err) => reject(err))
    } else {
      resolve(this.resolvedValues)
    }
  }

  runTasks() {
    return new Promise((resolve, reject) => {
      this.run(resolve, reject)
    })
  }
}

module.exports.ConcurrentTaskQueue = ConcurrentTaskQueue;

// const batchSize = 2;
// const taskQueue = new ConcurrentTaskQueue([
//   // wrap all functions to prevent direct execution
//   () => costlyFunction(10),
//   () => costlyFunction(20),
//   () => costlyFunction(100),
//   () => costlyFunction(50),
// ], batchSize);
// taskQueue.runTasks()
//   .then(([res1, res2, res3, res4]) => {
//     console.log(res1, res2, res3, res4);
//   });