export function checkBoxCanSelect(item:any):boolean {
  const {pathname} = location;
  return item.id.toString()== pathname.split('/').pop()
}