import 'reflect-metadata';
import { HardReset } from '../helpers/update-loop';

export type ServiceClassType = new (...args: any[]) => Service;

export function Inject(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    setTimeout(() => {
      let targetType = target?.constructor?.$meta?.type;
      if (targetType === 'view') {
        throw new Error(`Do not use 'Inject()' in views, use injection at constructor instead. Class: ${target?.constructor?.name}`);
      } else if (targetType === 'service') {
        throw new Error(`Do not use 'Inject()' in services, use injection at constructor instead. Class: ${target?.constructor?.name}`);
      }
    });

    let propertyType: any = Reflect.getMetadata('design:type', target, propertyKey) || [];
    let service = Service.get(propertyType);
    if (service) {
      target[propertyKey] = service;
      HardReset.subscribe(() => {
        target[propertyKey] = service;
      });
    } else {
      throw new Error(`Injection Error! Class: "${target.constructor.name}", property: "${propertyKey.toString()}"`);
    }
  };
}

export function ServiceDecorator() {
  return function (ServiceClass: ServiceClassType): any {
    let paramtypes = Service.getParametersMeta(ServiceClass);
    if (paramtypes.some(type => !type)) {
      console.error(`Circular dependency: ${ServiceClass.name}`);
    }

    (<any>ServiceClass).$meta = {
      paramtypes,
      type: 'service'
    };
  };
}

export class Service {
  private static serviceInstances = new Map<ServiceClassType, Service>();

  static get<T extends Service>(ServiceClass: new (...args: any[]) => T): T {
    let service = this.serviceInstances.get(ServiceClass);
    if (!service) {
      let resolvedArgs: any[] = this.resolveParameters([], (<any>ServiceClass).$meta.paramtypes);
      service = new ServiceClass(...resolvedArgs);
      this.serviceInstances.set(ServiceClass, service);
    }
    return <T>service;
  }

  static getParametersMeta(target: new (...args: any[]) => any): any[] {
    let paramtypes: any[] = Reflect.getMetadata('design:paramtypes', target) || [];
    if (paramtypes.some(type => !type)) {
      console.error(`Circular dependency: ${target.name}`);
    }
    return paramtypes;
  }

  private static resolveParameters(knownArgs: any[], paramtypes: any[]): any[] {
    let params = [...knownArgs];
    if (paramtypes.length > knownArgs.length) {
      let remainingParamTypes = paramtypes.slice(knownArgs.length);
      let remainingParams = remainingParamTypes.map(paramtype => {
        if (paramtype && paramtype.$meta?.type === 'service') {
          return this.get(paramtype);
        }
      });
      params.push(...remainingParams);
    }
    return params;
  }

  private static hardReset() {
    this.serviceInstances = new Map<ServiceClassType, Service>();
  }

  private symbol = Symbol(); // to differentiate this class to empty object
}

HardReset.subscribe((<any>Service).hardReset.bind(Service));
