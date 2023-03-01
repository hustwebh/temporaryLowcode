import { IPublicTypePageSchema } from '@alilc/lowcode-types';
import { material } from '@alilc/lowcode-engine';
import { filterPackages } from '@alilc/lowcode-plugin-inject';

export const setPageSchemaToLocalStorage = (pageSchema: IPublicTypePageSchema) => {
  localStorage.setItem("currentPageSchema", JSON.stringify(pageSchema))
}
export const getPageSchemaFromLocalStorage = () => {
  // if (!scenarioName) {
  //   console.error('scenarioName is required!');
  //   return;
  // }
  return JSON.parse(localStorage.getItem("currentPageSchema") || '{}');
}

export const setPackgesToLocalStorage = async () => {
  const packages = await filterPackages(material.getAssets().packages);
  console.log("packages",packages);
  
  localStorage.setItem('packages', JSON.stringify(packages));
}
export const getPackagesFromLocalStorage = () => {
  // if (!scenarioName) {
  //   console.error('scenarioName is required!');
  //   return;
  // }
  return JSON.parse(localStorage.getItem('packages') || '[]');
}
