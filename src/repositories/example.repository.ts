import {DefaultCrudRepository} from '@loopback/repository';
import {Example, ExampleRelations} from '../models';
import {ExampleDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ExampleRepository extends DefaultCrudRepository<
  Example,
  typeof Example.prototype.ID,
  ExampleRelations
> {
  constructor(
    @inject('datasources.example') dataSource: ExampleDataSource,
  ) {
    super(Example, dataSource);
  }
}
