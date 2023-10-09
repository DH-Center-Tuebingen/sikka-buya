const NamedModel = require("../../models/named-model");
const { Database, WriteableDatabase } = require("../../utils/database");


class NamedGQL {
  constructor(name) {
    this.name = name;
    const namedModel = new NamedModel(name);

    this.Queries = {};
    this.Queries[name] = async () => namedModel.list();
    this.Queries[`get${this.capitalizedName}`] = async (_, { id } = {}) => namedModel.get(id);
    this.Queries[`search${this.capitalizedName}`] = async (_, { text } = {}) => namedModel.search(text);

    this.Mutations = {};
    this.Mutations[`add${this.capitalizedName}`] = async (_, { name = {} } = {}) => namedModel.add(name);
    this.Mutations[`update${this.capitalizedName}`] = async (_, { id, name = {} } = {}) => namedModel.update(id, name);
    this.Mutations[`delete${this.capitalizedName}`] = async (_, { id } = {}) => namedModel.delete(id);
  }

  get capitalizedName() {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
}

module.exports = NamedGQL;