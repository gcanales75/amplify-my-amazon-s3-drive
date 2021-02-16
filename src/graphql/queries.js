/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getObject = /* GraphQL */ `
  query GetObject($id: ID!) {
    getObject(id: $id) {
      id
      username
      key_object
      createdAt
      updatedAt
    }
  }
`;
export const listObjects = /* GraphQL */ `
  query ListObjects(
    $filter: ModelObjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listObjects(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        username
        key_object
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const listObjectByUser = /* GraphQL */ `
  query ListObjectByUser(
    $username: ID
    $key_object: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelObjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listObjectByUser(
      username: $username
      key_object: $key_object
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        username
        key_object
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
