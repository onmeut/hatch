drop extension if exists "pg_net";

drop trigger if exists "update_events_updated_at" on "public"."events";

drop trigger if exists "update_profiles_updated_at" on "public"."profiles";

drop policy "Anyone can view events" on "public"."events";

drop policy "Users can create events" on "public"."events";

drop policy "Users can delete own events" on "public"."events";

drop policy "Users can update own events" on "public"."events";

drop policy "Users can insert own profile" on "public"."profiles";

drop policy "Users can update own profile" on "public"."profiles";

drop policy "Users can view all profiles" on "public"."profiles";

drop policy "Event creators can delete registrations" on "public"."registrations";

drop policy "Event creators can update registrations" on "public"."registrations";

drop policy "Event creators can view registrations" on "public"."registrations";

drop policy "Users can cancel own registration" on "public"."registrations";

drop policy "Users can register for events" on "public"."registrations";

drop policy "Users can view own registrations" on "public"."registrations";

alter table "public"."registrations" drop constraint "registrations_user_id_fkey";

drop function if exists "public"."update_updated_at"();

drop index if exists "public"."idx_profiles_email";

alter table "public"."events" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."registrations" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."registrations" add constraint "registrations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."registrations" validate constraint "registrations_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$function$
;


  create policy "Authenticated users can create events"
  on "public"."events"
  as permissive
  for insert
  to public
with check ((auth.uid() = creator_id));



  create policy "Events are viewable by everyone"
  on "public"."events"
  as permissive
  for select
  to public
using (true);



  create policy "Users can delete their own events"
  on "public"."events"
  as permissive
  for delete
  to public
using ((auth.uid() = creator_id));



  create policy "Users can update their own events"
  on "public"."events"
  as permissive
  for update
  to public
using ((auth.uid() = creator_id));



  create policy "Public profiles are viewable by everyone"
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



  create policy "Users can insert their own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Authenticated users can register for events"
  on "public"."registrations"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Registrations are viewable by everyone"
  on "public"."registrations"
  as permissive
  for select
  to public
using (true);



  create policy "Users can cancel their own registrations"
  on "public"."registrations"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));


CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


