





// type AuthResponse {
//   success: Boolean
//   message: String
//   token: String
//   user: User
// }

// input GeoJSONInput {
//   type: String
//   coordinates: [Float]
// }

// type GeoJSON {
//   type: String
//   coordinates: [Float]
// }

// type Material {
//   id: ID
//   name: String
// }

// input UserInput {
//   email: String!
//   password: String!
// }

// type User {
//   id: ID
//   email: String
//   super: Boolean
// }

// input NameInput {
//   id: ID
//   name: String
// }

// input PersonInput {
//   id: ID
//   name: String
//   shortName: String
//   role: ID
//   dynasty: ID
// }

// input MintInput {
//   id: ID
//   name: String
//   location: GeoJSONInput
//   uncertain: Boolean
//   uncertainLocation: GeoJSONInput
// }

// type CoinSideInformation {
//   fieldText: String
//   innerInscript: String
//   intermediateInscript: String
//   outerInscript: String
//   misc: String
// }

// input CoinSideInformationInput {
//   fieldText: String = ""
//   innerInscript: String = ""
//   intermediateInscript: String = ""
//   outerInscript: String = ""
//   misc: String = ""
// }

// type ReducedCoinType {
//   id: ID
//   projectId: String
//   treadwellId: String
//   completed: Boolean
//   reviewed: Boolean
// }

// type CoinType {
//   id: ID
//   projectId: String
//   treadwellId: String
//   mint: Mint
//   mintAsOnCoin: String
//   material: Material
//   nominal: Nominal
//   yearOfMint: String
//   donativ: Boolean
//   procedure: String
//   issuers: [TitledPerson]
//   overlords: [Overlord]
//   otherPersons: [Person]
//   caliph: Person
//   avers: CoinSideInformation
//   reverse: CoinSideInformation
//   cursiveScript: Boolean
//   coinMarks: [CoinMark]
//   literature: String
//   pieces: [String]
//   specials: String
//   excludeFromTypeCatalogue: Boolean
//   excludeFromMapApp: Boolean
//   internalNotes: String
//   yearUncertain: Boolean
//   mintUncertain: Boolean
// }

// input CoinTypeInput {
//   id: ID = null
//   projectId: String = ""
//   treadwellId: String = ""
//   mint: ID = null
//   mintAsOnCoin: String = ""
//   material: ID = null
//   nominal: ID = null
//   yearOfMint: String = ""
//   donativ: Boolean = false
//   procedure: String = ""
//   issuers: [TitledPersonInput] = []
//   overlords: [OverlordInput] = []
//   otherPersons: [ID] = []
//   caliph: ID = null
//   avers: CoinSideInformationInput
//   reverse: CoinSideInformationInput
//   cursiveScript: Boolean = false
//   coinMarks: [ID] = []
//   literature: String = ""
//   pieces: [String] = []
//   specials: String = ""
//   excludeFromTypeCatalogue: Boolean
//   excludeFromMapApp: Boolean
//   internalNotes: String
//   yearUncertain: Boolean
//   mintUncertain: Boolean
// }

// type CoinMark {
//   id: ID
//   name: String
// }

// type Mint {
//   id: ID
//   name: String
//   location: GeoJSON
//   uncertain: Boolean
//   uncertainLocation: GeoJSON
// }

// type Person {
//   id: ID
//   name: String
//   shortName: String
//   role: Role
//   dynasty: Dynasty
// }

// type Role {
//   id: ID
//   name: String
// }

// type Dynasty {
//   id: ID
//   name: String
// }

// input TitledPersonInput {
//   person: ID!
//   titles: [ID]!
//   honorifics: [ID]!
// }

// type Title {
//   id: ID
//   name: String!
// }

// type Honorific {
//   id: ID
//   name: String!
// }

// type Nominal {
//   id: ID
//   name: String!
// }

// type Dominion {
//   overlord: Person
//   mints: [Mint]!
// }

// type RuledMint {
//   mint: Mint
//   overlords: [Overlord]!
// }

// type Range {
//   from: Int
//   to: Int
// }

// type Query {
//   ping: String
//   getGeo: [GeoJSON]

//   coinMark: [CoinMark]
//   nominal: [Nominal]!
//   material: [Material]!
//   person: [Person]!
//   honorific: [Honorific]!
//   title: [Title]!
//   mint: [Mint]!
//   dynasty: [Dynasty]!
//   role: [Role]
//   timespan: Range

//   searchCoinMark(text: String): [CoinMark]!
//   searchHonorific(text: String): [Honorific]!
//   searchMaterial(text: String): [Material]!
//   searchMint(text: String): [Mint]!
//   searchTitle(text: String): [Title]!
//   searchNominal(text: String): [Nominal]!
//   searchPerson(text: String): [Person]!
//   searchDynasty(text: String): [Dynasty]!
//   searchRole(text: String): [Role]!

//   searchTypes(text: String): [CoinType]!

//   searchPersonsWithRole(
//     text: String!
//     include: [String]
//     exclude: [String]
//   ): [Person]!
//   searchPersonsWithoutRole(text: String!): [Person]!

//   getCoinMark(id: Int!): CoinMark
//   getHonorific(id: Int!): Honorific
//   getMaterial(id: Int!): Material
//   getMint(id: Int!): Mint
//   getPerson(id: Int!): Person
//   getTitle(id: Int!): Title
//   getNominal(id: Int!): Nominal
//   getDynasty(id: Int!): Dynasty
//   getRole(id: Int!): Role

//   getAnalytics: Analytics

//   getOverlord(id: ID!): Overlord

//   getReducedCoinTypeList(id: ID): [ReducedCoinType]
//   getCoinType(id: ID!): CoinType

//   getTypesByOverlord(id: ID!): [CoinType]
//   getTypes(yearOfMint:Int): [CoinType]
  

//   getTypeComplete(id: ID!): Boolean

//   getDominion(year: Int): [Dominion]
//   ruledMint(year:Int): [RuledMint]

//   users: [User]

//   login(data: UserInput): AuthResponse
//   auth(token: String): User
// }

// type Mutation {
//   setup(data: UserInput): Boolean

//   addCoinMark(data: NameInput): Void
//   updateCoinMark(data: NameInput): Void
//   deleteCoinMark(id: Int): Void

//   addHonorific(data: NameInput): Void
//   updateHonorific(data: NameInput): Void
//   deleteHonorific(id: Int): Void

//   addMaterial(data: NameInput): Void
//   updateMaterial(data: NameInput): Void
//   deleteMaterial(id: Int): Void

//   addMint(data: MintInput): Void
//   updateMint(data: MintInput): Void
//   deleteMint(id: Int): Void

//   addPerson(data: PersonInput): Void
//   updatePerson(data: PersonInput): Void
//   deletePerson(id: Int): Void

//   addTitle(data: NameInput): Void
//   updateTitle(data: NameInput): Void
//   deleteTitle(id: Int): Void

//   addNominal(data: NameInput): Void
//   updateNominal(data: NameInput): Void
//   deleteNominal(id: Int): Void

//   addDynasty(data: NameInput): Void
//   updateDynasty(data: NameInput): Void
//   deleteDynasty(id: Int): Void

//   addRole(data: NameInput): Void
//   updateRole(data: NameInput): Void
//   deleteRole(id: Int): Void

//   addCoinType(data: CoinTypeInput): Void
//   removeCoinType(id: ID): Void
//   updateCoinType(id: ID, data: CoinTypeInput): Void

//   setTypeComplete(id: ID!, completed: Boolean = true): Boolean
//   setTypeReviewed(id: ID!, reviewed: Boolean = true): Boolean

//   inviteUser(email: String): Boolean
//   acceptInvite(email: String, password: String): Void
// }

// type Overlord {
//   id: ID
//   name: String
//   shortName: String
//   role: Role
//   dynasty: Dynasty
//   titles: [Title]!
//   honorifics: [Honorific]!
//   rank: Int
// }

// type TitledPerson {
//   id: ID
//   person: Person
//   titles: [Title]
//   honorifics: [Honorific]
// }

// input OverlordInput {
//   type: ID
//   person: ID!
//   rank: Int!
//   titles: [Int]!
//   honorifics: [Int]!
// }

// type Analytics {
//   typeCount: Int
//   mintCount: Int
//   yearCount: Int
// }
