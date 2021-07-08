import { TextLayer } from '@deck.gl/layers';
// @ts-ignore
import { TextData } from 'typings';

export default (data?: TextData[] | TextData) => {
  if (data === undefined || data === null) {
    return [];
  }
  const getLayer = (_data: TextData, index = 0) => {
    const set = new Set<string>();
    ((_data.data || []) as any[]).forEach((item) => {
      const text = _data.getText ? _data.getText(item) : item;
      text.split('').forEach((s: string) => {
        set.add(s);
      });
    }, []);
    const characterSet = [...set];
    return new TextLayer({
      id: `text-layer-${index}`,
      ..._data,
      characterSet,
    });
  };
  if (Array.isArray(data)) {
    return data.map((item: TextData, index: number) => (item ? getLayer(item, index) : null));
  }
  return [getLayer(data)];
};
