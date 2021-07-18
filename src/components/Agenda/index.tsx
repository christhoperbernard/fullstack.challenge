import React, { ReactElement, useContext, useMemo, useState } from 'react'
import { DateTime } from 'luxon'

import greeting from 'lib/greeting'

import Calendar from 'src/models/Calendar'
import Event from 'src/models/Event'
import AccountContext from 'src/context/accountContext'

import List from './List'
import EventCell from './EventCell'

import style from './style.scss'

type AgendaItem = {
  calendar: Calendar
  event: Event
}

const compareByDateTime = (a: AgendaItem, b: AgendaItem) =>
  a.event.date.diff(b.event.date).valueOf()

/**
 * Agenda component
 * Displays greeting (depending on time of day)
 * and list of calendar events
 */

const Agenda = (): ReactElement => {
  const account = useContext(AccountContext)

  const [selectedCalendarColor, setSelectedCalendarColor] = useState('all');
  const events: AgendaItem[] = useMemo(
    () =>
      account.calendars
        .filter((calendar) => selectedCalendarColor === 'all' ? true : calendar.color === selectedCalendarColor)
        .flatMap((calendar) =>
          calendar.events.map((event) => ({ calendar, event })),
        )
        .sort(compareByDateTime),
    [account, selectedCalendarColor],
  )

  const title = useMemo(() => greeting(DateTime.local().hour), [DateTime.local().hour])

  return (
    <div className={style.outer}>
      <div className={style.container}>
        <div className={style.header}>
          <span className={style.title}>{title}</span>
        </div>

        {/* Filter by Calendar (assuming color is the id) (level 3) */}
        <select onChange={(e) => setSelectedCalendarColor(e.target.value)}>
          <option key="all" value="all">All Calendar</option>
          {account.calendars.flatMap((calendar) => {
            return (<option key={calendar.color} value={calendar.color}>{calendar.color}</option>)
          })}
        </select>

        <List>
          {events.map(({ calendar, event }) => (
            <EventCell key={event.id} calendar={calendar} event={event} />
          ))}
        </List>
      </div>
    </div>
  )
}

export default Agenda
