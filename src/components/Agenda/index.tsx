import React, { ReactElement, useContext, useMemo, useState } from 'react'
import { DateTime } from 'luxon'

import greeting from 'lib/greeting'

import Calendar from 'src/models/Calendar'
import Event from 'src/models/Event'
import AccountContext from 'src/context/accountContext'

import List from './List'
import EventCell from './EventCell'
import SectionHeader from './SectionHeader'

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
  const [viewByDepartment, setViewByDepartment] = useState(false);
  const events: AgendaItem[] = useMemo(
    () =>
      account.calendars
        .filter((calendar) => selectedCalendarColor === 'all' ? true : calendar.id === selectedCalendarColor)
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

        <div className={style.menu}>
          {/* Filter by Calendar (assuming color is the id) (level 3) */}
          <select className={style.filter} onChange={(e) => setSelectedCalendarColor(e.target.value)}>
            <option key="all" value="all">All Calendar</option>
            {account.calendars.flatMap((calendar) => {
              return (<option key={calendar.id} value={calendar.id}>{calendar.id}</option>)
            })}
          </select>
          {/* Toggle View By Department or All Departments (level 4) */}
          <button onClick={() => setViewByDepartment(!viewByDepartment)}>Toggle View By Department</button>
        </div>

        {
          viewByDepartment ? getAgendaByDepartment(events): getAgenda(events)
        }
  
      </div>
    </div>
  )
}

function getAgenda(agendaItems: AgendaItem[]) {
  return (
  <List>
    {agendaItems.map(({ calendar, event }) => (
      <EventCell key={event.id} calendar={calendar} event={event} />
    ))}
  </List>)
}

function getAgendaByDepartment(agendaItems: AgendaItem[]) {
  const agendaItemsMap: {[department: string]: AgendaItem[]} = {};
  agendaItems.forEach((item: AgendaItem) => {
    if (item.event.department && !agendaItemsMap[item.event.department]) {
      agendaItemsMap[item.event.department] = [];
    } else if (!agendaItemsMap['No Department']) {
      agendaItemsMap['No Department'] = [];
    }

    if (item.event.department) {
      agendaItemsMap[item.event.department].push(item);
    } else {
      agendaItemsMap['No Department'].push(item);
    }
  });

  return (
    <>
      {Object.keys(agendaItemsMap).map((department: string) => {
        return (
          <React.Fragment key={department}>
            <SectionHeader label={department}/>
            <List>
              {agendaItemsMap[department].map(({ calendar, event }) => (
                <EventCell key={event.id} calendar={calendar} event={event} />
              ))}
            </List>
          </React.Fragment>
        );
      })}
    </>
  )
}

export default Agenda
