import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import { decode, encode } from 'html-entities';
import { argv } from '../cli';
import { AzureTranslateResponse, JSONObj } from '../payload';
import { Translate } from '../translate';
import { addCustomCert } from '../util';

export class AzureOfficialAPI extends Translate {
  private static readonly endpoint: string = 'api.cognitive.microsofttranslator.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'Ocp-Apim-Subscription-Key': argv.key,
      'Ocp-Apim-Subscription-Region': argv.region,
      'Content-type': 'application/json',
      'X-ClientTraceId': crypto.randomUUID(),
    },
    params: {
      'api-version': '3.0',
      from: argv.from,
      to: argv.to,
    },
    responseType: 'json',
  };

  constructor() {
    super();
    if (argv.certificatePath)
      AzureOfficialAPI.axiosConfig.httpsAgent = addCustomCert(argv.certificatePath);
  }

  protected callTranslateAPI = (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    axios
      .post(
        `https://${AzureOfficialAPI.endpoint}/translate`,
        [{ text: encode(valuesForTranslation.join(Translate.sentenceDelimiter)) }],
        AzureOfficialAPI.axiosConfig
      )
      .then((response) => {
        const value = (response as AzureTranslateResponse).data[0].translations[0].text;
        this.saveTranslation(decode(value), originalObject, saveTo);
      })
      .catch((error) => this.printAxiosError(error as AxiosError, saveTo));
  };
}
