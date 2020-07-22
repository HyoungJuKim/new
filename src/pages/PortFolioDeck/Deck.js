import React, { useState, useEffect, useImperativeHandle } from 'react';
import { useSprings } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import { ForwardOutlined } from '@ant-design/icons';

import Card from './Card';
import PortfolioData from './PortfolioData';

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = i => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -5 + Math.random() * 5,
  delay: i * 100
});
// const to = i => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 5, delay: i * 100 });
const from = i => ({ x: 3000, rot: 0, scale: 1.5, y: 0 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) =>
  `perspective(1300px) rotateX(0deg) rotateY(${r / 500}deg) rotateZ(${r}deg) scale(${s})`;

const Deck = React.forwardRef((Parent, ref) => {
  const { callback, currentIdx } = Parent;

  useImperativeHandle(ref, () => ({
    getNext() {
      next();
    },
    getRedeck() {
      reDeck();
    }
  }));

  const reDeck = () => {
    callback(PortfolioData.length);
    set(i => {
      setTimeout(() => gone.clear() || set(i => to(i)), 300);
    });
  };

  const next = () => {
    set(i => {
      // 반복 돌면서
      if (currentIdx === i) {
        // 현재 카드번호의 카드를 찾는다
        gone.add(currentIdx); // 지나간 카드 오브젝트 gone에 해당 카드번호를 주입

        console.log(' gone : ', gone);
        if (gone.has(currentIdx)) {
          // Set에 해당 번호가 있으면
          callback(i); // 부모에게 해당 인덱스를 콜백함수로 주입.
        }

        return {
          x: 300 + window.innerWidth,
          rot: -10 + Math.random() * 200,
          scale: 1.03,
          delay: undefined,
          config: { friction: 50, tension: 130 }
        };
      } else if (gone.size === PortfolioData.length) {
        setTimeout(() => gone.clear() || set(i => to(i)), 600);
      }
    });
  };

  useEffect(() => {
    console.log('changed : ', currentIdx);
  }, [currentIdx]);

  const [gone] = useState(() => new Set()); // The set flags all the cards that are flicked out
  const [props, set] = useSprings(PortfolioData.length, i => ({
    ...to(i),
    from: from(i)
  })); // Create a bunch of springs using the helpers above
  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useDrag(
    ({ args: [index], down, movement: [mx], distance, direction: [xDir], velocity }) => {
      const trigger = velocity > 0.2; // If you flick hard enough it should trigger the card to fly out
      const dir = xDir < 0 ? -1 : 1; // Direction should either point left or right

      // 카드 넘기는 트리거
      if (!down && trigger) {
        gone.add(index);

        // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
      }
      set(i => {
        if (index !== i) return; // We're only interested in changing spring-data for the current spring
        const isGone = gone.has(index);
        const x = isGone ? (300 + window.innerWidth) * dir : down ? mx : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
        const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0); // How much the card tilts, flicking it harder makes it rotate faster
        const scale = down ? 1.03 : 1; // Active cards lift up a bit

        if (isGone) {
          console.log('callback');
          callback(index);
        }

        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 }
        };
      });
      if (!down && gone.size === PortfolioData.length) {
        setTimeout(() => gone.clear() || set(i => to(i)), 600);
      }
    }
  );

  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  const DeckList = props.map(({ x, y, rot, scale }, i) => {
    return (
      <Card
        key={i}
        i={i}
        x={x}
        y={y}
        rot={rot}
        scale={scale}
        trans={trans}
        data={PortfolioData[i]}
        bind={bind}
      />
    );
  });

  return DeckList;
  // return (
  //   <div style={{ position: 'absolute' }}>
  //     {}
  //     <div
  //       style={{ margin: '12px 0px', position: 'absolute', bottom: 70, left: 120 }}
  //       onClick={() => next()}
  //     >
  //       <ForwardOutlined style={{ fontSize: 18 }} onClick={() => next()} />
  //     </div>
  //   </div>
  // );
});

export default Deck;
