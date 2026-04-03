declare module "react-native" {
  import type { ComponentType } from "react";

  export type GestureResponderEvent = unknown;
  export type PanResponderGestureState = { dx: number; dy: number };

  export const Animated: {
    ValueXY: new (value?: { x: number; y: number }) => {
      x: unknown;
      y: unknown;
      setOffset: (value: { x: number; y: number }) => void;
      setValue: (value: { x: number; y: number }) => void;
      flattenOffset: () => void;
      getTranslateTransform: () => Array<Record<string, unknown>>;
    };
    View: ComponentType<Record<string, unknown>>;
    event: (...args: unknown[]) => (...eventArgs: unknown[]) => void;
  };

  export const PanResponder: {
    create: (config: Record<string, unknown>) => {
      panHandlers: Record<string, unknown>;
    };
  };

  export const Pressable: ComponentType<Record<string, unknown>>;
  export const ScrollView: ComponentType<Record<string, unknown>>;
  export const Text: ComponentType<Record<string, unknown>>;
  export const View: ComponentType<Record<string, unknown>>;

  export const StyleSheet: {
    absoluteFillObject: Record<string, unknown>;
    create: <T extends Record<string, Record<string, unknown>>>(styles: T) => T;
  };
}
