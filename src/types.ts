export type TsukiElement = {
  type: string;
  props: {
    [key: string]: unknown;
    children: TsukiElement[];
  };
};

export type TsukiChild = TsukiElement | string | number;
