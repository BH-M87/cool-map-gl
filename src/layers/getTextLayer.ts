import { TextLayer } from '@deck.gl/layers';
// @ts-ignore
import { TextData } from 'typings';

export default (data?: TextData[] | TextData) => {
  if (data === undefined || data === null) {
    return [];
  }
  const getLayer = (_data: TextData, index = 0) => {
    const characterSet = ((_data.data || []) as any[]).reduce((item) => {
      const text = _data.getText ? _data.getText(item) : item;
      return item.concat(text.split(''));
    }, []);
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
