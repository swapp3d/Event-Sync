package org.swap.eventsync.repositories;

import org.swap.eventsync.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {}
