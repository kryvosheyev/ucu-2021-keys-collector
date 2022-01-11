const { fromEvent, Subject } = require('rxjs')
const { take } = require('rxjs/operators')
const { Transform } = require('stream')

const createTransformStreamSubject = (
  nodeJsStream,
) => {
  const chunk$ = new Subject()
  const push$ = new Subject()
  const transformStream$ = new Subject()

  transformStream$
  ._next = (
    transformStream$
    .next
    .bind(transformStream$)
  )

  const transformStream = (
    new Transform({
      readableObjectMode: true,

      transform(
        chunk,
        encoding,
        callback,
      ) {
        chunk$
        .pipe(
          take(1),
        )
        .subscribe(callback)

        transformStream$
        ._next(chunk)
      },

      writableObjectMode: true,
    })
  )

  push$
  .subscribe(value => {
    transformStream
    .push(value)
  })

  const transformedStream = (
    nodeJsStream
    .pipe(transformStream)
  )

  transformStream$
  .stream = transformedStream

  fromEvent(
    transformedStream,
    'finish',
  )
  .subscribe(() => {
    chunk$
    .complete()

    transformStream$
    .complete()

    push$
    .complete()
  })

  transformStream$
  .push = (
    value,
  ) => {
    push$
    .next(value)
  }

  transformStream$
  .next = () => {
    chunk$
    .next()
  }

  return transformStream$
}

module.exports = createTransformStreamSubject
