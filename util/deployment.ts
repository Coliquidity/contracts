import { NetworkName } from './network'
import { ensure } from './ensure'
import { Address } from './types'

export interface Deployment {
  network: NetworkName
  address: Address
}

export function getDeploymentByNetwork(deployments: Deployment[], network: NetworkName) {
  return ensure(deployments.find(d => d.network === network))
}
