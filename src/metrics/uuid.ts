/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { v4 as UUIDv4, validate as UUIDvalidate } from "uuid";

import { Metric, MetricType, CommonMetricData } from "metrics";
import { isString } from "utils";
import Glean from "glean";

export class UUIDMetric extends Metric<string, string> {
  constructor(v: unknown) {
    super(v);
  }

  validate(v: unknown): v is string {
    if (!isString(v)) {
      return false;
    }
  
    return UUIDvalidate(v);
  }

  payload(): string {
    return this._inner;
  }
}

/**
 *  An UUID metric.
 *
 * Stores UUID v4 (randomly generated) values.
 */
class UUIDMetricType extends MetricType {
  constructor(meta: CommonMetricData) {
    super("uuid", meta);
  }

  /**
   * Sets to the specified value.
   *
   * @param value the value to set.
   *
   * @throws In case `value` is not a valid UUID.
   */
  async set(value: string): Promise<void> {
    if (!this.shouldRecord()) {
      return;
    }

    if (!value) {
      value = UUIDv4();
    }

    let metric: UUIDMetric;
    try {
      metric = new UUIDMetric(value);
    } catch {
      // TODO: record error once Bug 1682574 is resolved.
      console.warn(`"${value}" is not a valid UUID. Ignoring`);
      return;
    }

    await Glean.db.record(this, metric);
  }

  /**
   * Generates a new random uuid and sets the metric to it.
   *
   * @returns The generated value or `undefined` in case this metric shouldn't be recorded.
   */
  async generateAndSet(): Promise<string | undefined> {
    if (!this.shouldRecord()) {
      return;
    }

    const value = UUIDv4();
    await this.set(value);

    return value;
  }
 
  /**
   * **Test-only API**
   *
   * Gets the currently stored value as a string.
   *
   * This doesn't clear the stored value.
   *
   * TODO: Only allow this function to be called on test mode (depends on Bug 1682771).
   *
   * @param ping the ping from which we want to retrieve this metrics value from.
   *
   * @returns The value found in storage or `undefined` if nothing was found.
   */
  async testGetValue(ping: string): Promise<string | undefined> {
    return Glean.db.getMetric<string>(ping, this);
  }
}
 
export default UUIDMetricType;