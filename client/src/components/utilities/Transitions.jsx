import { useTransition, animated, config } from 'react-spring'

export function Mount(props) {
    const transitions = useTransition(props.show, {
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
      reverse: props.show,
      delay: 200,
      config: config.molasses
    });

    return transitions(
      (styles, item) => item &&
        <animated.div style={styles}>
            {props.content}
        </animated.div>
    );
}