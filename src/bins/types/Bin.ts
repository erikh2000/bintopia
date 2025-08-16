type Bin = {
  id:number,
  items:string[]
}

export function duplicateBin(bin:Bin):Bin {
  return {
    id: bin.id,
    items: [...bin.items]
  };
}

export function createEmptyBin(binId:number):Bin {
  return {
    id: binId,
    items: []
  };
}

export default Bin;