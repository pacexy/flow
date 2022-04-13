import React from 'react'

import { str } from '@turbospace/internal'
import { Button } from '@turbospace/react-library'
import { add } from '@turbospace/ts-library'

export default function Web() {
  return (
    <div>
      <h1>{str}</h1>
      <p>{add(1, 1)}</p>
      <Button />
    </div>
  )
}
