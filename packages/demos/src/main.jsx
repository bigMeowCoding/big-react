import * as React from 'react';
import { createRoot } from 'react-dom';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Cannot find #root container.');
}

const root = createRoot(container);
const element = <div>hello world</div>;
console.log('element', element);
root.render(element);

console.log('Using local workspace react package:', React);
