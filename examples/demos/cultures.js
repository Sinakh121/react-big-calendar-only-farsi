import React from 'react'
import { Calendar } from 'react-big-calendar'
import events from '../events'
import Layout from 'react-tackle-box/Layout'

import ExampleControlSlot from '../ExampleControlSlot'
import jalaliLocalizer from './../../src/localizers/jalali-moment'
require('globalize/lib/cultures/globalize.culture.fa')

class Cultures extends React.Component {

  render() {
    let cultures = ['fa']

    return (
      <React.Fragment>
        <ExampleControlSlot.Entry waitForOutlet>
          <Layout direction="column" align="center">
            <label>Select a Culture</label>{' '}
            <select
              className="form-control"
              style={{ width: 200, display: 'inline-block' }}
              defaultValue={'en'}
              onChange={e => this.setState({ culture: e.target.value })}
            >
              {cultures.map((c, idx) => (
                <option key={idx} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Layout>
        </ExampleControlSlot.Entry>
        <Calendar
          rtl={true}
          events={events}
          culture="fa"
          defaultDate={new Date(2015, 3, 18)}
          localizer={jalaliLocalizer}
          
        />
      </React.Fragment>
    )
  }
}

export default Cultures
