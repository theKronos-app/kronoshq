import { CAN_USE_DOM } from '@lexical/utils';
import {useEffect, useLayoutEffect} from 'react';

// This workaround is no longer necessary in React 19,
// but we currently support React >=17.x
// https://github.com/facebook/react/pull/26395
// taken from lexical codebase courtesy of Meta
const useLayoutEffectImpl: typeof useLayoutEffect = CAN_USE_DOM
  ? useLayoutEffect
  : useEffect;

export default useLayoutEffectImpl;