import { decode, encode } from 'html-entities';
import { SourceLanguageCode, TargetLanguageCode, TextResult, Translator } from 'deepl-node';
import { argv } from '../cli';
import { JSONObj } from '../payload';
import { Translate } from '../translate';

interface ErrorResponse {
  response: { statusCode: number; statusMessage: string };
  errors: [{ message: string }];
}

export class DeepLAPI extends Translate {
  protected callTranslateAPI = (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    new Translator(argv.key)
      .translateText(
        encode(valuesForTranslation.join(Translate.sentenceDelimiter)),
        argv.from as SourceLanguageCode,
        argv.to as TargetLanguageCode
      )
      .then((response: TextResult) => {
        this.saveTranslation(decode(response.text), originalObject, saveTo);
      })
      .catch((error) => {
        const err = error as ErrorResponse;
        const errorFilePath = saveTo.replace(`${argv.to}.json`, `${argv.from}.json`);
        console.error(`Request error for file: ${errorFilePath}`);
        if (err.response?.statusCode && err.response.statusMessage && err.errors[0].message) {
          console.log(`Status Code: ${err.response.statusCode}`);
          console.log(`Status Text: ${err.response.statusMessage}`);
          console.log(`Data: ${JSON.stringify(err.errors[0].message)}`);
        } else {
          console.log(error);
        }
      });
  };
}
