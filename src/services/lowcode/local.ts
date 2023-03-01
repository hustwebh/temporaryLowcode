import { IPublicTypeProjectSchema } from '@alilc/lowcode-types';
import { material,project } from '@alilc/lowcode-engine';
import { filterPackages } from '@alilc/lowcode-plugin-inject';

export const setProjectSchemaToLocalStorage = (pageSchema: IPublicTypeProjectSchema) => {
  localStorage.setItem("currentProjectSchema", JSON.stringify(pageSchema))
}
export const getPageSchemaFromLocalStorage = () => {
  // if (!scenarioName) {
  //   console.error('scenarioName is required!');
  //   return;
  // }
  return JSON.parse(localStorage.getItem("currentProjectSchema") || '{}');
}

export const setPackgesToLocalStorage = async () => {
  const packages = await filterPackages(material.getAssets().packages);
  localStorage.setItem('packages', JSON.stringify(packages));
}
export const getPackagesFromLocalStorage = () => {
  // if (!scenarioName) {
  //   console.error('scenarioName is required!');
  //   return;
  // }
  return JSON.parse(localStorage.getItem('packages') || '[]');
}
