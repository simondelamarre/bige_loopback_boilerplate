import {Entity, model, property} from '@loopback/repository';

@model()
export class Example extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  ID?: number;

  @property({
    type: 'string',
  })
  name?: string;


  constructor(data?: Partial<Example>) {
    super(data);
  }
}

export interface ExampleRelations {
  // describe navigational properties here
}

export type ExampleWithRelations = Example & ExampleRelations;
