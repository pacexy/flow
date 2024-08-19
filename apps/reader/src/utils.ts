import datastore from "./datastore"

export function keys<T extends object>(o: T) {
  return Object.keys(o) as (keyof T)[]
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function last<T>(array: T[]) {
  return array[array.length - 1]
}

export function group<T>(array: T[], getKey: (item: T) => string | number) {
  const o: Record<string, T[]> = {}

  array.forEach((item) => {
    const key = getKey(item)
    o[key] = [...(o[key] ?? []), item]
  })

  return o
}

export function copy(text: string) {
  return navigator.clipboard.writeText(text)
}

export function parseCFI(cfi: string) {
  let cfiFilter = cfi.replace(/epubcfi/g, "");
  cfiFilter = cfiFilter.replace(/\(/g, "");
  cfiFilter = cfiFilter.replace(/\(/g, "")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [epubPart = '', xhtmlPart, ...offsets] = cfiFilter.split(',');
  const [cfiBase, xhtmlElementPath = ''] = epubPart.split('!');
  const characterOffsets = offsets.map(offset => {
    const [part, position] = offset.split(':');
    return { part: parseInt(part!), position: parseInt(position!) };
  });

  return {
    cfiBase,
    paragraph: xhtmlElementPath,
    characterOffsets: characterOffsets
  };
}

export function getPromptFromCFI(cfi: {cfiBase: string, paragraph: string, characterOffsets: string} | any, bookTitle: string) {
  if(datastore[bookTitle]) {
    const book = datastore[bookTitle];
    console.log(' book[cfi.cfiBase]', book[cfi.cfiBase]);
    if (book[cfi.cfiBase]) {
      const bookSection = book[cfi.cfiBase];
      const paragraphs: any[] = bookSection.paragraphs;
      const findParagraph = paragraphs.find((p) => p.paragraph === cfi.paragraph) || {};

      // if findParagraph is not found, we use prompt of section
      return findParagraph.prompt || bookSection.prompt;
    }
  }
  return undefined;
}
