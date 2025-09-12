import { module } from 'angular';

import { REST } from '@spinnaker/core';

export const ORACLE_IMAGE_IMAGE_READER = 'spinnaker.oracle.image.reader';
export const name = ORACLE_IMAGE_IMAGE_READER; // for backwards compatibility

module(ORACLE_IMAGE_IMAGE_READER, []).factory('oracleImageReader', [
  function () {
    function findImages(params: any) {
      return REST('/images/find').query(params).get();
    }

    function getImage(imageId: string, region: string, credentials: string) {
      return REST(`/images/${credentials}/${region}/${imageId}`)
        .get()
        .then(
          (image: any) => image,
          () => null,
        );
    }

    return {
      findImages: findImages,
      getImage: getImage,
    };
  },
]);
