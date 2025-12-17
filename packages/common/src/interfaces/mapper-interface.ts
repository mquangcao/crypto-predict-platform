export abstract class Mapper<Source, Target> {
  abstract map(source: Source): Target;
}
