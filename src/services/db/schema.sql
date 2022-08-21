-- Users
drop table if exists profiles;

create table profiles (
  id uuid references auth.users primary key,
  name text,
  avatar text
);

drop table if exists profiles_private;

create table profiles_private (
  id uuid references profiles(id) primary key,
  email text,
  admin boolean default false not null
);

alter table
  profiles_private enable row level security;

create policy "Profiles are only visible by the user who owns it" on profiles_private for
select
  using (auth.uid() = id);

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists handle_new_user();
create function handle_new_user() returns trigger language plpgsql security definer
set search_path = public as $$ begin
insert into
  profiles (id, name, avatar)
values
  (
    new.id,
    new.raw_user_meta_data :: json ->> 'full_name',
    new.raw_user_meta_data :: json ->> 'avatar_url'
  );

insert into
  profiles_private (id, email)
values
  (new.id, new.email);

update invitations set user_id = new.id where email = new.email;

return new;

end;
$$;

create trigger on_auth_user_created
after
insert
  on auth.users for each row execute procedure handle_new_user();

-- Sessions
create table sessions (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc' :: text, now()) not null,
  updated_at timestamp with time zone default timezone('utc' :: text, now()) not null,
  title text not null,
  description text not null,
  scheduled_from timestamp with time zone not null,
  scheduled_to timestamp with time zone not null,
  user_id uuid default auth.uid() not null,
  constraint user_id foreign key(user_id) references profiles(id) on delete cascade
);

-- Invitations
create table invitations (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc' :: text, now()) not null,
  updated_at timestamp with time zone default timezone('utc' :: text, now()) not null,

  email text not null, 
  title text not null,
  description text not null,
  emailed boolean default false,
  viewed boolean default false,
 
  user_id uuid,
  constraint user_id foreign key(user_id) references profiles(id) on delete cascade
);

-- Settings
create table settings (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc' :: text, now()) not null,
  updated_at timestamp with time zone default timezone('utc' :: text, now()) not null,
  start_time integer not null,
  end_time integer not null,
  timezone text not null,
  user_id uuid default auth.uid() not null,
  constraint user_id foreign key(user_id) references profiles(id) on delete cascade
);

-- Calendar
create
or replace function public.get_calendar() returns table (
  day timestamp with time zone,
  hours json []
) language plpgsql as $$ begin return query with availability as (
  select
    ts :: timestamp with time zone,
    row_to_json(s.*) as session
  from
    generate_series(
      current_date - '24 hours' :: interval,
      current_date + (7 * 24 - 1 || ' hours') :: interval,
      '1 hour'
    ) as ts
    left join sessions as s on date_part('year', s.scheduled_from) = date_part('year', ts)
    and date_part('month', s.scheduled_from) = date_part('month', ts)
    and date_part('day', s.scheduled_from) = date_part('day', ts)
    and date_part('hour', s.scheduled_from) <= date_part('hour', ts)
    and date_part('hour', s.scheduled_to) > date_part('hour', ts)
  order by
    ts asc
) select
  date_trunc('day', availability.ts),
  array_agg(
    json_build_object(
      'ts',
      availability.ts,
      'session',
      availability.session
    )
  )
from
  availability
group by
  date_trunc('day', availability.ts)
order by
  date_trunc('day', availability.ts) asc;

end $$;

create function get_calendar()
    returns TABLE(date timestamp with time zone, session json)
    language plpgsql
as
$$
begin return query
  select
    ts :: timestamp with time zone,
    row_to_json(s.*) as session
  from
    generate_series(
      current_date - '24 hours' :: interval,
      current_date + (8 * 24 - 1 || ' hours') :: interval,
      '1 hour'
    ) as ts
    left join sessions as s on date_part('year', s.scheduled_from) = date_part('year', ts)
    and date_part('month', s.scheduled_from) = date_part('month', ts)
    and date_part('day', s.scheduled_from) = date_part('day', ts)
    and date_part('hour', s.scheduled_from) <= date_part('hour', ts)
    and date_part('hour', s.scheduled_to) > date_part('hour', ts)
  order by
    ts asc;
end
$$;