// Minimal test stub for `@nestjs/typeorm`.
module.exports = {
  InjectRepository: () => () => {},
  getRepositoryToken: (entity) =>
    typeof entity === 'string' ? `Repository<${entity}>` : `Repository<${entity?.name ?? 'Entity'}>`,
  TypeOrmModule: {
    forFeature: () => [],
    forRoot: () => [],
    forRootAsync: () => [],
  },
};