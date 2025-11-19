// Minimal test stub for `typeorm` used by unit tests.
// Provides decorator factories and tiny helpers used by entities/repositories.
const noopDecorator = () => (_target, _propertyKey, _descriptor) => {};
const classDecoratorNoop = () => (target) => target;

module.exports = {
  // Entities / decorators
  Entity: (opts) => classDecoratorNoop(),
  Column: (opts) => noopDecorator,
  PrimaryGeneratedColumn: (opts) => noopDecorator,
  PrimaryColumn: (opts) => noopDecorator,
  CreateDateColumn: (opts) => noopDecorator,
  UpdateDateColumn: (opts) => noopDecorator,
  OneToMany: (typeFn, inverse) => noopDecorator,
  ManyToOne: (typeFn, inverse) => noopDecorator,
  JoinColumn: (opts) => noopDecorator,
  Index: (opts) => classDecoratorNoop(),
  Check: (expr) => classDecoratorNoop(),
  // Query helpers used in repositories
  Between: (from, to) => ({ __between: [from, to] }),
  Not: (val) => ({ __not: val }),
  // Basic Repository & helpers (no-op)
  Repository: class {},
  BaseEntity: class {},
  getRepository: () => ({}),
  // TypeORM decorators sometimes accessed by property
  default: {},
};
