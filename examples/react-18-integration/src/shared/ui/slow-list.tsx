import React from 'react';

const SlowItem: React.FC<{ text: string }> = ({ text }) => {
  const startTime = performance.now();
  while (performance.now() - startTime < 100) {
    // Do nothing for 100 ms to emulate extremely slow code
  }

  return <li className="item">Text: {text}</li>;
};

export const SlowList: React.FC<{ text?: string }> = React.memo((props) => {
  const items = Array.from({ length: 10 }).map((_, index) => (
    <SlowItem key={index} text={props.text ?? `${index}`} />
  ));

  return <ul>{items}</ul>;
});
