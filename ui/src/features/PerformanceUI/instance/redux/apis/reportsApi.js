import axios from 'axios';
import env from '../../../../../App/common/env';
import {getUrlPrefix} from "../../utils";

export const getReportsFromFramework = (queryParams, testId) => {
  let url = queryParams ? `${getUrlPrefix()}${env.PREDATOR_URL}/tests/${testId}/reports${queryParams}` : `${env.PREDATOR_URL}/tests/${testId}/reports`;

  return axios.get(url, {
    headers: {
    }
  });
};

export const getReportFromFramework = (testId, runId) => {
  return axios.get(`${getUrlPrefix()}${env.PREDATOR_URL}/tests/${testId}/reports/${runId}`, {
    headers: {
    }
  });
};

export const getAggregateFromFramework = (testId,reportId) => {
  return axios.get(`${getUrlPrefix()}${env.PREDATOR_URL}/tests/${testId}/reports/${reportId}/aggregate`, {
    headers: {
    }
  });
};

export const getLastReportsFromFramework = (queryParams) => {
  queryParams = queryParams ? '?limit=50' : undefined;

  let url = queryParams ? `${getUrlPrefix()}${env.PREDATOR_URL}/tests/last_reports${queryParams}` : `${getUrlPrefix()}${env.PREDATOR_URL}/tests/last_reports?limit=50`;
  return axios.get(url, {
    headers: {
    }
  });
};
