--
-- PostgreSQL database dump
--

\restrict opKaXYc9q7FK00ob0wmpm5tufmFPiyv61cNB8frIZZ3R9Lck66KzWOPvi5Pb5fg

-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: check_examiner_quota(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_examiner_quota() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      DECLARE
        examiner_count INT;
        max_slots INT;
      BEGIN
        -- Count existing slots where this examiner is assigned
        SELECT COUNT(*) INTO examiner_count
        FROM slot_examiners se
        WHERE se.examiner_name = NEW.examiner_name;
        
        -- Get max_slots dari dosen table
        SELECT d.max_slots INTO max_slots
        FROM dosen d
        WHERE LOWER(d.nama) = LOWER(NEW.examiner_name);
        
        -- Jika max_slots ditentukan, cek quota
        IF max_slots IS NOT NULL AND examiner_count >= max_slots THEN
          RAISE EXCEPTION 'Examiner % sudah mencapai batas maksimal % slot', 
                          NEW.examiner_name, max_slots;
        END IF;
        
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.check_examiner_quota() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    action_type character varying(50) NOT NULL,
    target character varying(100) NOT NULL,
    description text,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_settings (
    setting_key character varying(100) NOT NULL,
    setting_value text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.app_settings OWNER TO postgres;

--
-- Name: dosen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dosen (
    id integer NOT NULL,
    nik character varying(50) NOT NULL,
    nama character varying(255) NOT NULL,
    prodi character varying(255),
    fakultas character varying(10) NOT NULL,
    excluded boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    exclude boolean DEFAULT false,
    pref_gender character varying(1),
    max_slots integer
);


ALTER TABLE public.dosen OWNER TO postgres;

--
-- Name: dosen_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dosen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dosen_id_seq OWNER TO postgres;

--
-- Name: dosen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dosen_id_seq OWNED BY public.dosen.id;


--
-- Name: libur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.libur (
    id integer NOT NULL,
    date character varying(20),
    "time" character varying(20),
    room character varying(100),
    reason character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nik character varying(50),
    dosen_name character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public.libur OWNER TO postgres;

--
-- Name: libur_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.libur_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.libur_id_seq OWNER TO postgres;

--
-- Name: libur_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.libur_id_seq OWNED BY public.libur.id;


--
-- Name: mahasiswa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mahasiswa (
    id integer NOT NULL,
    nim character varying(50) NOT NULL,
    nama character varying(255) NOT NULL,
    prodi character varying(255) NOT NULL,
    pembimbing character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    gender character varying(10),
    penguji_1 character varying(255),
    penguji_2 character varying(255)
);


ALTER TABLE public.mahasiswa OWNER TO postgres;

--
-- Name: mahasiswa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mahasiswa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mahasiswa_id_seq OWNER TO postgres;

--
-- Name: mahasiswa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mahasiswa_id_seq OWNED BY public.mahasiswa.id;


--
-- Name: master_dosen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_dosen (
    id integer NOT NULL,
    nik character varying(50) NOT NULL,
    nama character varying(255) NOT NULL,
    status character varying(50),
    kategori character varying(100),
    nidn character varying(50),
    jenis_kelamin character varying(10),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.master_dosen OWNER TO postgres;

--
-- Name: master_dosen_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.master_dosen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_dosen_id_seq OWNER TO postgres;

--
-- Name: master_dosen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_dosen_id_seq OWNED BY public.master_dosen.id;


--
-- Name: slot_examiners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.slot_examiners (
    id integer NOT NULL,
    slot_id integer NOT NULL,
    examiner_name character varying(255) NOT NULL,
    examiner_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.slot_examiners OWNER TO postgres;

--
-- Name: slot_examiners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.slot_examiners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.slot_examiners_id_seq OWNER TO postgres;

--
-- Name: slot_examiners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.slot_examiners_id_seq OWNED BY public.slot_examiners.id;


--
-- Name: slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.slots (
    id integer NOT NULL,
    date character varying(20) NOT NULL,
    "time" character varying(20) NOT NULL,
    room character varying(100) NOT NULL,
    student character varying(255) NOT NULL,
    mahasiswa_nim character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.slots OWNER TO postgres;

--
-- Name: slots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.slots_id_seq OWNER TO postgres;

--
-- Name: slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.slots_id_seq OWNED BY public.slots.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'admin'::character varying,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: dosen id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dosen ALTER COLUMN id SET DEFAULT nextval('public.dosen_id_seq'::regclass);


--
-- Name: libur id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libur ALTER COLUMN id SET DEFAULT nextval('public.libur_id_seq'::regclass);


--
-- Name: mahasiswa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mahasiswa ALTER COLUMN id SET DEFAULT nextval('public.mahasiswa_id_seq'::regclass);


--
-- Name: master_dosen id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_dosen ALTER COLUMN id SET DEFAULT nextval('public.master_dosen_id_seq'::regclass);


--
-- Name: slot_examiners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slot_examiners ALTER COLUMN id SET DEFAULT nextval('public.slot_examiners_id_seq'::regclass);


--
-- Name: slots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slots ALTER COLUMN id SET DEFAULT nextval('public.slots_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, action_type, target, description, "timestamp") FROM stdin;
165	IMPORT	Mahasiswa	Bulk import 106 data mahasiswa. Auto-correct pembimbing: 58.	2026-02-11 23:01:49.141154
167	UPDATE	Mahasiswa	Update data mahasiswa FAAIZ DAFFA FATHAN F. (22.96.3578)	2026-02-11 23:06:19.508593
169	UPDATE	Mahasiswa	Update data mahasiswa INTAN NURSANTI NUGROHO (22.96.3542)	2026-02-11 23:06:42.836768
170	UPDATE	Mahasiswa	Update data mahasiswa FIGO EKA PRADHIKA (22.96.3523)	2026-02-11 23:06:50.307466
173	UPDATE	Mahasiswa	Update data mahasiswa Calvin Destyan Pradana (22.96.3456)	2026-02-11 23:07:33.199935
174	UPDATE	Mahasiswa	Update data mahasiswa ANGELIA MAHARANI WIRAPUTERI (22.96.3405)	2026-02-11 23:07:43.073065
175	UPDATE	Mahasiswa	Update data mahasiswa FADHIL WINNES GALAEH PRATAMA (22.96.3378)	2026-02-11 23:07:51.330914
176	UPDATE	Mahasiswa	Update data mahasiswa BILQYSSA BIANCHA PUTRI RYANTI (22.96.3371)	2026-02-11 23:07:58.962836
179	UPDATE	Mahasiswa	Update data mahasiswa RISTA PUTRI EKA PERTIWI (22.96.3325)	2026-02-11 23:08:30.332488
180	UPDATE	Mahasiswa	Update data mahasiswa FADHILLA NUR FAJRIYAH (22.96.3266)	2026-02-11 23:08:38.649808
186	UPDATE	Mahasiswa	Update data mahasiswa VISHUNATAN JUNSI KRISTA PUTRA (22.96.3337)	2026-02-11 23:09:55.744312
188	UPDATE	Mahasiswa	Update data mahasiswa Muhammad Adib Fikri L (19.96.1056)	2026-02-11 23:14:25.444467
190	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 105.	2026-02-11 23:16:03.408952
192	CREATE MANUAL	Jadwal	Manual schedule: Annahda Djafniel Yudanur di 2026-02-27 13:00 (5.2.8)	2026-02-11 23:17:44.261121
194	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:18:56.902681
195	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:19:00.058107
198	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:19:14.65843
200	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:23:24.222236
202	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:23:49.940434
204	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:23:55.832402
205	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 0.	2026-02-11 23:23:58.836547
206	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 0.	2026-02-11 23:24:04.178611
207	DELETE ALL	Jadwal	Menghapus SEMUA jadwal ujian (13 slot)	2026-02-11 23:24:50.711026
208	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:24:57.872222
209	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:25:01.025791
212	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:25:19.349236
214	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:25:35.65574
216	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:25:44.774521
218	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:25:51.647653
219	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:26:34.973207
221	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 93.	2026-02-11 23:27:05.59882
223	UPDATE EXAMINER	Jadwal	Update penguji Muhammad Adib Fikri L: Dr. Nurbayti, S.I.Kom., M.A., Marita Nurharjanti, S.Pd., M.Pd	2026-02-11 23:28:50.293597
225	CREATE MANUAL	Jadwal	Manual schedule: Annahda Djafniel Yudanur di 2026-02-27 13:00 (5.2.8)	2026-02-11 23:31:15.815231
226	IMPORT	Mahasiswa	Bulk import 1 data mahasiswa. Auto-correct pembimbing: 0.	2026-02-12 13:40:15.732918
228	IMPORT	Mahasiswa	Bulk import 1 data mahasiswa. Auto-correct pembimbing: 0.	2026-02-12 13:48:28.023484
230	IMPORT	Mahasiswa	Bulk import 15 data mahasiswa. Auto-correct pembimbing: 8.	2026-02-12 14:01:57.10535
233	UPDATE	Mahasiswa	Update data mahasiswa RAFIFA AMALDHIA PUTRI (22.96.3319)	2026-02-12 14:02:57.385546
235	DELETE ALL	Jadwal	Menghapus SEMUA jadwal ujian (119 slot)	2026-02-12 14:05:33.182697
237	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:06:36.928068
240	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:06:43.728887
241	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:06:45.721117
243	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:06:50.626772
245	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:07:03.808719
247	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:07:08.619678
248	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 0.	2026-02-12 14:07:10.80117
249	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 0.	2026-02-12 14:07:16.126151
251	DELETE ALL	Jadwal	Menghapus SEMUA jadwal ujian (12 slot)	2026-02-12 14:07:55.583591
255	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:08:19.549569
256	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:08:22.178652
259	DELETE ALL	Jadwal	Menghapus SEMUA jadwal ujian (4 slot)	2026-02-12 14:09:41.270083
260	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:10:35.478343
166	DELETE ALL	Jadwal	Menghapus SEMUA jadwal ujian (0 slot)	2026-02-11 23:03:55.458553
168	UPDATE	Mahasiswa	Update data mahasiswa ANNISA ALWI SYAHIDAH (22.96.3548)	2026-02-11 23:06:31.284844
171	UPDATE	Mahasiswa	Update data mahasiswa ZA'IM MUTHAHARI (22.96.3497)	2026-02-11 23:07:14.385243
172	UPDATE	Mahasiswa	Update data mahasiswa MUHAMMAD FANDI NUR SETYWAN (22.96.3483)	2026-02-11 23:07:21.652365
177	UPDATE	Mahasiswa	Update data mahasiswa NOFIKASARI (22.96.3329)	2026-02-11 23:08:10.652956
178	UPDATE	Mahasiswa	Update data mahasiswa HAIDAR KRESNA PAMUJI (22.96.3326)	2026-02-11 23:08:20.096714
181	UPDATE	Mahasiswa	Update data mahasiswa MUHAMMAD ARRASIT (22.96.3010)	2026-02-11 23:08:47.099868
182	UPDATE	Mahasiswa	Update data mahasiswa ABU REIKHAN ALFARISI ZUFRI (21.96.2700)	2026-02-11 23:08:56.986965
183	UPDATE	Mahasiswa	Update data mahasiswa MUHAMMAD FACHRIANSYAH (21.96.2629)	2026-02-11 23:09:04.557584
184	UPDATE	Mahasiswa	Update data mahasiswa HANUM ARI PRIHANDINI (21.96.2268)	2026-02-11 23:09:12.225101
185	UPDATE	Mahasiswa	Update data mahasiswa Dhimas Arjuna Nur Kuncoro (20.96.2209)	2026-02-11 23:09:19.695373
187	UPDATE	Mahasiswa	Update data mahasiswa NASYA AZZAHRA (21.96.2614)	2026-02-11 23:10:08.023477
189	UPDATE	Mahasiswa	Update data mahasiswa Dhimas Arjuna Nur Kuncoro (20.96.2209)	2026-02-11 23:14:58.288809
191	DELETE ALL	Jadwal	Menghapus SEMUA jadwal ujian (105 slot)	2026-02-11 23:16:45.85843
193	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:18:53.1893
196	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:19:08.223403
197	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:19:11.688401
199	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:19:17.555245
201	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:23:28.415025
203	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:23:53.043556
210	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:25:03.872156
211	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:25:06.435522
213	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:25:22.265641
215	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:25:42.302275
217	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:25:47.659835
220	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-11 23:26:38.099291
222	UPDATE EXAMINER	Jadwal	Update penguji Dhimas Arjuna Nur Kuncoro: Estiningsih, SE, MM, Achmad Fauzan., Dr., S.Psi., M.Psi., MM	2026-02-11 23:28:29.247041
224	DELETE	Jadwal Ujian	Menghapus jadwal ujian: Annahda Djafniel Yudanur pada 2026-02-24 13:00	2026-02-11 23:30:50.208243
227	IMPORT	Mahasiswa	Bulk import 5000 data mahasiswa. Auto-correct pembimbing: 0.	2026-02-12 13:46:57.275425
229	DELETE	Mahasiswa	Menghapus data mahasiswa NIM 12345	2026-02-12 13:59:52.660045
231	UPDATE	Mahasiswa	Update data mahasiswa HERBAGAS BAGUS TARUNA (20.96.1768)	2026-02-12 14:02:34.363459
232	UPDATE	Mahasiswa	Update data mahasiswa Saif Arkan Arib Maulana (20.96.1804)	2026-02-12 14:02:42.400247
234	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 13.	2026-02-12 14:04:23.347532
236	CREATE MANUAL	Jadwal	Manual schedule: Annahda Djafniel Yudanur di 2026-02-27 13:00 (5.2.8)	2026-02-12 14:06:20.161608
238	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:06:39.275082
239	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:06:41.658048
242	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:06:48.167623
244	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:06:53.216859
246	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:07:06.146563
250	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 0.	2026-02-12 14:07:28.436596
252	DELETE ALL	Jadwal	Menghapus SEMUA jadwal ujian (0 slot)	2026-02-12 14:08:08.77214
253	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:08:14.247767
254	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:08:17.159241
257	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 0.	2026-02-12 14:08:24.804732
258	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 0.	2026-02-12 14:08:55.323411
261	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:10:38.212555
262	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:10:40.68789
263	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:10:42.760476
264	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:10:44.972713
265	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:11:01.134495
266	DELETE ALL	Jadwal	Menghapus SEMUA jadwal ujian (6 slot)	2026-02-12 14:11:49.758584
267	DELETE ALL	Jadwal	Menghapus SEMUA jadwal ujian (0 slot)	2026-02-12 14:14:54.08437
268	CREATE	Ketersediaan Dosen	Menandai Riski Damastuti, S.Sos., M.A. TIDAK BERSEDIA pada tanggal 2026-02-24 (sibuk kuliah)	2026-02-12 14:15:32.74206
269	CREATE	Ketersediaan Dosen	Menandai Riski Damastuti, S.Sos., M.A. TIDAK BERSEDIA pada tanggal 2026-02-25 (sibuk kuliah)	2026-02-12 14:15:32.776099
270	DELETE	Ketersediaan Dosen	Menghapus status tidak bersedia: aturan Riski Damastuti, S.Sos., M.A. pada tanggal 2026-02-25	2026-02-12 14:23:00.582675
271	DELETE	Ketersediaan Dosen	Menghapus status tidak bersedia: aturan Riski Damastuti, S.Sos., M.A. pada tanggal 2026-02-24	2026-02-12 14:23:00.583663
272	CREATE	Ketersediaan Dosen	Menandai Riski Damastuti, S.Sos., M.A. TIDAK BERSEDIA pada tanggal 2026-02-19 (sibuk kuliah)	2026-02-12 14:23:00.589636
273	CREATE	Ketersediaan Dosen	Menandai Riski Damastuti, S.Sos., M.A. TIDAK BERSEDIA pada tanggal 2026-02-20 (sibuk kuliah)	2026-02-12 14:23:00.592686
274	CREATE	Ketersediaan Dosen	Menandai Riski Damastuti, S.Sos., M.A. TIDAK BERSEDIA pada tanggal 2026-02-23 (sibuk kuliah)	2026-02-12 14:23:00.595743
275	CREATE	Ketersediaan Dosen	Menandai Riski Damastuti, S.Sos., M.A. TIDAK BERSEDIA pada tanggal 2026-02-26 (sibuk kuliah)	2026-02-12 14:23:00.600435
276	CREATE	Ketersediaan Dosen	Menandai Riski Damastuti, S.Sos., M.A. TIDAK BERSEDIA pada tanggal 2026-02-27 (sibuk kuliah)	2026-02-12 14:23:00.603618
277	CREATE	Ketersediaan Dosen	Menandai Riski Damastuti, S.Sos., M.A. TIDAK BERSEDIA pada tanggal 2026-03-02 (sibuk kuliah)	2026-02-12 14:23:00.606641
278	CREATE MANUAL	Jadwal	Manual schedule: Annahda Djafniel Yudanur di 2026-02-25 13:00 (5.2.8)	2026-02-12 14:23:25.240788
279	MOVE	Jadwal	Memindahkan jadwal Annahda Djafniel Yudanur ke 2026-02-25 08:30 (5.2.8)	2026-02-12 14:23:32.264706
280	MOVE	Jadwal	Memindahkan jadwal Annahda Djafniel Yudanur ke 2026-02-25 08:30 (5.2.4)	2026-02-12 14:23:34.473832
281	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:23:51.06108
282	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:23:59.482995
283	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:03.996945
284	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:05.759047
285	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:07.399629
286	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:09.153706
287	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:10.774563
288	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:12.284483
289	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:19.44728
290	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:21.252213
291	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:23.225811
292	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:26.171359
293	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:27.996732
294	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:38.352445
295	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 14:24:40.227086
296	DELETE	Jadwal Ujian	Menghapus jadwal ujian: ALISHA LARASATI UTOMO pada 2026-02-18 08:30	2026-02-12 14:34:01.891666
297	DELETE	Jadwal Ujian	Menghapus jadwal ujian: ILYAS SETYAWAN pada 2026-02-18 10:00	2026-02-12 14:34:03.815523
298	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 107.	2026-02-12 14:35:59.165361
299	IMPORT	Mahasiswa	Bulk import 4 data mahasiswa. Auto-correct pembimbing: 1.	2026-02-12 14:46:07.107588
300	UPDATE	Mahasiswa	Update data mahasiswa Kolonius Octoviery Bayu Adwiandy Puryadi (21.96.2502)	2026-02-12 14:46:20.564057
301	UPDATE	Mahasiswa	Update data mahasiswa MUHAMMAD FAIZ JORDAN (21.96.2841)	2026-02-12 14:46:27.995571
302	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 4.	2026-02-12 14:46:51.452314
303	CREATE	Mahasiswa	Menambah data mahasiswa MUHAMMAD NAWAWI MUDA SEMIRI (22.96.3547) - Prodi: S1 Ilmu Komunikasi	2026-02-12 15:31:59.201767
304	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-12 15:32:15.865753
305	IMPORT	Mahasiswa	Bulk import 4 data mahasiswa. Auto-correct pembimbing: 3.	2026-02-12 15:48:33.667473
306	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 4.	2026-02-12 15:49:36.526284
307	IMPORT	Mahasiswa	Bulk import 6 data mahasiswa. Auto-correct pembimbing: 3.	2026-02-12 15:55:15.003427
308	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 6.	2026-02-12 15:55:29.788936
309	IMPORT	Mahasiswa	Bulk import 26 data mahasiswa. Auto-correct pembimbing: 36.	2026-02-12 16:00:19.440816
310	UPDATE	Mahasiswa	Update data mahasiswa Melati Sekar Waditra (20.92.0282)	2026-02-12 16:01:57.011936
311	UPDATE	Mahasiswa	Update data mahasiswa Muhammad Rifqi Pratama (21.92.0325)	2026-02-12 16:02:27.964328
312	UPDATE	Mahasiswa	Update data mahasiswa Muhammad Rifqi Pratama (21.92.0325)	2026-02-12 16:03:14.593374
313	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 26.	2026-02-13 01:22:16.941464
314	IMPORT	Mahasiswa	Bulk import 5 data mahasiswa. Auto-correct pembimbing: 12.	2026-02-13 01:27:59.72839
315	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 5.	2026-02-13 01:28:20.10337
316	IMPORT	Mahasiswa	Bulk import 15 data mahasiswa. Auto-correct pembimbing: 28.	2026-02-13 01:31:29.696865
317	UPDATE	Mahasiswa	Update data mahasiswa SILVIA DEWI RAMAWATI (19.95.0146)	2026-02-13 01:32:24.961714
318	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 15.	2026-02-13 01:32:38.385649
319	IMPORT	Mahasiswa	Bulk import 12 data mahasiswa. Auto-correct pembimbing: 22.	2026-02-13 01:41:09.486389
320	UPDATE	Mahasiswa	Update data mahasiswa Vina Aliya Farhatayni (22.94.0296)	2026-02-13 01:41:52.801476
321	IMPORT	Mahasiswa	Bulk import 8 data mahasiswa. Auto-correct pembimbing: 17.	2026-02-13 01:42:00.098833
322	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 20.	2026-02-13 01:42:10.865609
323	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 09:27:27.759501
324	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 09:27:42.271838
325	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 09:27:46.825448
326	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 09:28:02.064158
327	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 09:28:05.314803
328	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 09:28:22.937671
329	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 09:28:25.471279
330	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 09:28:27.804443
331	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 09:28:29.960123
332	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 09:28:36.515131
333	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 09:28:38.449146
334	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 09:28:40.403153
335	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 14.	2026-02-13 09:28:45.267312
336	DELETE	Jadwal Ujian	Menghapus jadwal ujian: PAULINA ANUGRAHNI pada 2026-02-20 10:00	2026-02-13 11:08:44.678996
337	DELETE	Jadwal Ujian	Menghapus jadwal ujian: Faiz Karima pada 2026-02-20 08:30	2026-02-13 11:09:10.947042
338	UPDATE	Mahasiswa	Update data mahasiswa PAULINA ANUGRAHNI (22.92.0468)	2026-02-13 11:10:00.875457
339	UPDATE	Mahasiswa	Update data mahasiswa Faiz Karima (22.92.0466)	2026-02-13 11:10:18.116123
340	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 11:10:23.165864
341	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 11:10:31.470779
342	MOVE	Jadwal	Memindahkan jadwal PAULINA ANUGRAHNI ke 2026-02-26 08:30 (5.2.3)	2026-02-13 11:11:14.441275
343	MOVE	Jadwal	Memindahkan jadwal Faiz Karima ke 2026-02-26 10:00 (5.2.3)	2026-02-13 11:12:12.57656
344	MOVE	Jadwal	Memindahkan jadwal Faiz Karima ke 2026-02-26 10:00 (5.2.1)	2026-02-13 11:12:17.337932
345	CREATE	Mahasiswa	Menambah data mahasiswa BAGAS KURNIAWAN (21.91.0186) - Prodi: S1 Ekonomi	2026-02-13 11:16:21.697665
346	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 11:16:27.355938
347	CREATE	Mahasiswa	Menambah data mahasiswa Novita Anggraeni (20.96.1794) - Prodi: S1 Ilmu Komunikasi	2026-02-13 12:28:48.883792
348	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 12:29:06.399094
349	MOVE	Jadwal	Memindahkan jadwal Novita Anggraeni ke 2026-03-03 10:00 (5.2.2)	2026-02-13 12:33:04.114566
350	MOVE	Jadwal	Memindahkan jadwal Novita Anggraeni ke 2026-03-03 10:00 (5.2.1)	2026-02-13 12:33:08.952002
351	DELETE	Jadwal Ujian	Menghapus jadwal ujian: A RIZAL E SOALOON LUBIS pada 2026-02-19 10:00	2026-02-13 15:44:38.943196
352	DELETE	Jadwal Ujian	Menghapus jadwal ujian: Mayra Putri Juliana pada 2026-02-19 13:00	2026-02-13 15:44:56.271315
353	DELETE	Jadwal Ujian	Menghapus jadwal ujian: Maranti Suryaningsih pada 2026-02-20 13:00	2026-02-13 15:45:08.225209
354	DELETE	Jadwal Ujian	Menghapus jadwal ujian: MELANI SALSABILA pada 2026-02-23 08:30	2026-02-13 15:45:20.45202
355	DELETE	Jadwal Ujian	Menghapus jadwal ujian: Gustiano Aditya Gunawan pada 2026-02-23 10:00	2026-02-13 15:45:36.188203
356	DELETE	Jadwal Ujian	Menghapus jadwal ujian: Faiz Karima pada 2026-02-26 10:00	2026-02-13 15:45:51.250978
357	CREATE	Ketersediaan Dosen	Menandai Dodi Setiawan R, S.Psi, MBA, Dr. TIDAK BERSEDIA pada tanggal 2026-02-19 (Tanpa Alasan)	2026-02-13 15:46:43.573817
359	CREATE	Ketersediaan Dosen	Menandai Dodi Setiawan R, S.Psi, MBA, Dr. TIDAK BERSEDIA pada tanggal 2026-02-26 (Tanpa Alasan)	2026-02-13 15:46:43.582816
358	CREATE	Ketersediaan Dosen	Menandai Dodi Setiawan R, S.Psi, MBA, Dr. TIDAK BERSEDIA pada tanggal 2026-02-23 (Tanpa Alasan)	2026-02-13 15:46:43.582183
360	CREATE	Ketersediaan Dosen	Menandai Dodi Setiawan R, S.Psi, MBA, Dr. TIDAK BERSEDIA pada tanggal 2026-03-02 (Tanpa Alasan)	2026-02-13 15:46:43.587497
361	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 15:54:28.26266
362	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 15:54:37.56142
363	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 15:54:40.526365
364	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 15:54:43.941061
365	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 15:54:46.743604
366	GENERATE	Jadwal	Generate jadwal (Incremental). Target: all. Berhasil: 1.	2026-02-13 15:54:49.481304
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_settings (setting_key, setting_value, updated_at) FROM stdin;
schedule_rooms	["5.2.1","5.2.2","5.2.3","5.2.4","5.2.5","5.2.6","5.2.7","5.2.8"]	2026-02-13 11:11:08.07006
schedule_disabled_rooms	[]	2026-02-13 11:11:08.07006
schedule_times	["08:30","10:00","11:30","13:00"]	2026-02-13 11:11:08.07006
schedule_dates	[{"value":"2026-02-18","label":"Rabu","display":"18 Feb"},{"value":"2026-02-19","label":"Kamis","display":"19 Feb"},{"value":"2026-02-20","label":"Jumat","display":"20 Feb"},{"value":"2026-02-23","label":"Senin","display":"23 Feb"},{"value":"2026-02-24","label":"Selasa","display":"24 Feb"},{"value":"2026-02-25","label":"Rabu","display":"25 Feb"},{"value":"2026-02-26","label":"Kamis","display":"26 Feb"},{"value":"2026-02-27","label":"Jumat","display":"27 Feb"},{"value":"2026-03-02","label":"Senin","display":"2 Mar"},{"value":"2026-03-03","label":"Selasa","display":"3 Mar"}]	2026-02-13 11:11:08.07006
\.


--
-- Data for Name: dosen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dosen (id, nik, nama, prodi, fakultas, excluded, created_at, updated_at, exclude, pref_gender, max_slots) FROM stdin;
1	190302174	Akhmad Dahlan , S.Kom., M.Kom.	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
2	190302483	Dewi Anisa Istiqomah, S.Pd., M.Cs	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
3	190302250	Dina Maulina, S.Kom., M.Kom.	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
4	190302491	Eko Rahmat Slamet Hidayat Saputra, M.Kom	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
5	190302688	Eko Tri Anggono, S.E., M.M	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
6	190302057	Heri Sismoro, S.Kom., M.Kom.	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
7	190302068	Jaeni , S.Kom., M.Eng.	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
8	190302288	Lilis Dwi Farida, S.Kom., M.Eng.	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
9	190302151	Lukman, S.Kom., M.Kom.	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
10	190302408	M. Nuraminudin, S.Kom., M.Kom.	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
11	190302455	Melany Mustika Dewi, S.Kom., M.Kom.	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
12	190302722	Rendy Mahardika, S.Kom., M.Kom	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
13	190302239	Supriatin, A.Md., S.Kom., M.Kom.	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
14	190302146	Yuli Astuti, S.Kom., M.Kom.	D3 Manajemen Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
15	190302148	Ahlihi Masruro, S.Kom., M.Kom.	D3 Teknik Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
16	190302495	Arvin C Frobenius, S.Kom., M.Kom.	D3 Teknik Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
17	190302618	Bahrun Ghozali, S.Kom., M.Kom	D3 Teknik Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
18	190302126	Barka Satya, S.Kom., M.Kom.	D3 Teknik Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
19	190302457	Dwi Rahayu, S.Kom., M.Kom	D3 Teknik Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
20	190302315	Firman Asharudin, S.Kom., M.Kom.	D3 Teknik Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
21	190302230	Hastari Utama, S.Kom., M.Cs.	D3 Teknik Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
22	190302161	Nila Feby Puspitasari, S.Kom., M.Cs.	D3 Teknik Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
23	190302409	Pramudhita Ferdiansyah, S.Kom., M.Kom.	D3 Teknik Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
24	190302458	Ria Andriani, S.Kom., M.Kom.	D3 Teknik Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
25	190302481	Surya Tri Atmaja Ramadhani, S.Kom.,M.Eng	D3 Teknik Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
26	190302407	Toto Indriyatmoko, M.Kom	D3 Teknik Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
28	190302494	Ade Pujianto, M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
29	190302356	Agit Amrullah, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
30	190302012	Agung Pambudi, S.T., M.A.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
31	190302708	Ahmad Ridwan, S.Tr.T., M.T	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
32	190302459	Ahmad Sa`di, S.Kom, M.Eng	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
33	190302255	Ainul Yaqin, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
34	190302705	Ajie Kusuma Wardhana, S.Kom., M.Eng	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
35	190302679	Amirudin Khorul Huda, M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
36	190302109	Andika Agus Slameto, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
37	190302290	Anna Baita, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
38	190302287	Arif Akbarul Huda, S.Si., M.Eng.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
39	190302150	Arif Dwi Laksito, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
40	190302289	Arifiyanto Hadinegoro, S.Kom., M.T.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
41	190302707	Bambang Pilu Hartato, S.Kom., M.Eng	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
42	190302484	Bayu Nadya Kusuma, S.T., M.Eng	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
43	190302216	Bayu Setiaji, M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
44	190302226	Dr. Emigawaty, M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
45	190302232	Dr. Hartatik, S.T., M.Cs.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
46	190302575	Dr. Kumara Ari Yuana, ST, MT	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
47	190302152	Drs. Asro Nasiri, M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
48	190302236	Dwi Nurani, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
49	190302706	Enda Putri Atika, M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
50	190302683	Fauzia Anis Sekarningrum, S.T., M.T	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
51	190302276	Ferian Fauzi Abdulloh, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
52	190302703	Hendri Kurniawan Prakosa, S.Kom., M.Cs	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
53	190302509	Herda Dicky Ramandita, M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
54	190302237	Ike Verawati, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
55	190302690	Irma Suwarning D, S.Psi., M.Psi	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
56	190302420	Juarisman, M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
57	190302159	Kamarudin, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
58	190302112	Kusnawi, S.Kom., M.Eng.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
59	190302393	Majid Rahardi, S.Kom., M.Eng.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
60	190302108	Mardhiya Hayaty, S.T., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
61	190302098	Muhammad Rudyanto Arief, S.T., M.T	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
62	190302281	Muhammad Tofa Nurcholis, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
63	190302492	Mujiyanto, M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
64	190302248	Mulia Sulistiyono, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
65	190302524	Nafiatun Sholihah, S,Kom., M.Cs	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
66	190302526	Novi Prisma Yunita, M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
67	190302066	Nur Aini, A.Md., S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
68	190302278	Nuri Cahyono, M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
69	190302711	Prasetyo Purnomo, S.Kom., M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
70	190302208	Raditya Wardhana, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
71	190302392	Rifda Faticha Alfa Aziza, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
72	190302215	Rizqi Sukma Kharisma, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
73	190302246	Rumini, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
74	190302413	Subektiningsih, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
75	190302035	Sudarmawan, S.T., M.T.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
76	190302375	Theopilus Bayu Sasongko, S.Kom., M.Eng.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
77	190302115	Tri Susanto, M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
78	190302110	Tristanto Ariaji, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
79	190302419	Uyock Anggoro Saputro, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
80	190302185	Windha Mega Pradnya Dhuhita, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
81	190302271	Yogi Piskonata, S.S, M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
82	190302702	Yudha Riwanto, M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
83	190302039	Yudi Sutanto, S.Kom., M.Kom.	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
84	190302238	Acihmah Sidauruk, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
85	190302348	Aditya Rizki Yudiantika, S.T., M.Eng	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
86	190302351	Afrig Aminuddin, S.Kom., M.Eng., Ph.D.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
87	190302242	Agung Nugroho, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
88	190302249	Agus Fatkhurohman, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
89	190302240	Alfie Nur Rahmi, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
90	190302192	Ali Mustopa, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
91	190302270	Andriyan Dwi Putra, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
92	190302163	Anggit Dwi Hartanto, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
93	190302684	Arif Nur Rohman, M.Kom	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
94	190302354	Atik Nurmasani, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
95	190302209	Azis Catur Laksono, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
96	190302254	Bety Wulan Sari, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
97	190302704	Deni Kurnianto Nugroho, S.Pd., M.Eng	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
98	190302154	Devi Wulandari, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
99	190302253	Donni Prabowo, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
100	190302029	Drs. Bambang Sudaryatno, M.M.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
101	190302227	Eli Pujastuti, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
102	190302231	Erni Seniwati, S.Kom, M.Cs	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
103	190302710	Fitriansyah, S.Si., M.Eng.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
104	190302676	Fiyas Mahananing Puri, M.Kom	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
105	190302244	Hendra Kurniawan, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
106	190302685	Ichsan Wasiso, M.Kom	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
107	190302391	Ika Asti Astuti, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
108	190302268	Ika Nur Fajri, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
109	190302282	Ikmah, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
110	190302011	Ir. Rum Mohamad Andri K Rasyid, M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
111	190302329	Irma Rofni Wulandari, S.Pd., M.Eng.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
112	190302415	Irwan Setiawanto, S.Kom, M.Eng	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
113	190302675	Kardilah Rohmat Hidayat, M.Kom	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
114	190302038	Krisnawati, S.Si., M.T.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
115	190302686	Marwan Noor Fauzy, M.Kom	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
116	190302187	Mei Parwanto Kurniawan, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
117	190302284	Moch Farid Fauzi, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
118	190302257	Netci Hesvindrati, SE, M.Kom	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
119	190302345	Niken Larasati, S.Kom, M.Eng	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
120	190302330	Ninik Tri Hartanti, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
121	190302245	Norhikmah, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
122	190302425	Nur Widjiyati, M.Kom	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
123	190302285	Sharazita Dyah Anggita, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
124	190302582	Stevi Ema Wijayanti, M.Kom	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
125	190302256	Sumarni Adi, S.Kom., M.Cs.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
126	190302258	Wiji Nurastuti, S.E., M.T.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
127	190302272	Wiwi Widayani, S.Kom., M.Kom.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
128	190302412	Yoga Pristyanto, S.Kom., M.Eng.	S1 Sistem Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
129	190302480	Anggit Ferdita Nugraha, S.T., M.Eng.	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
130	190302327	Banu Santoso, A.Md., S.T., M.Eng.	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
131	190302128	Dr. Dony Ariyus, S.S., M.Kom.	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
132	190302580	Eko Pramono, S.Si, M.T	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
133	190302456	Jeki Kuswanto, S.Kom., M.Kom.	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
134	190302181	Joko Dwi Santoso, S.Kom., M.Kom.	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
135	190302105	Melwin Syafrizal, S.Kom., M.Eng., Ph.D.	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
136	190302671	Miko Kastomo Putro, M.Kom.	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
137	190302454	Muhammad Koprawi, S.Kom., M.Eng.	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
138	190302335	Rina Pramitasari, S.Si., M.Cs.	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
139	190302312	Senie Destya, S.T., M.Kom.	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
140	190302452	Wahid Miftahul Ashari, S.Kom., M.T.	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
141	190302328	Wahyu Sukestyastama Putra, S.T., M.Eng.	S1 Teknik Komputer	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
142	555169	Adi Djayusman, S.Kom., M.Kom	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
143	190302631	Afifah Nur Aini, M.Kom	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
144	190302229	Agus Purwanto, A.Md., S.Kom., M.Kom.	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
145	190302467	Ahmad Zaid Rahman, M.Kom	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
146	190302031	Aryanto Yuniawan, S.Kom., M.Kom.	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
147	190302243	Bernadhed, S.Kom., M.Kom.	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
148	190302164	Bhanu Sri Nugraha, S.Kom., M.Kom.	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
149	190302652	Buyut Khoirul Umri, M.Kom	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
150	190302687	Caraka Aji Pranata, M.Kom	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
151	190302427	Dhimas Adi Satria, S.Kom., M.Kom.	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
152	190302350	Dwi Miyanto, S.ST., M.T	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
153	190302286	Haryoko, S.Kom., M.Cs.	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
154	190302390	Ibnu Hadi Purwanto, S.Kom., M.Kom.	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
155	190302421	Ifraweri Raja Mangkuto HP, S. Pd., M.Kom	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
156	190302504	Imam Ainudin Pirmansah, M.Kom	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
157	190302584	Lia Ayu Ivanjelita, M.Kom	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
158	190302332	Muhammad Fairul Filza, S.Kom., M.Kom.	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
159	190302497	Muhammad Misbahul Munir, M.Kom	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
160	190302418	Muzakki Ahmad, M.Kom	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
161	190302551	Nadea Cipta Laksmita, M.Kom	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
162	190302552	Rifai Ahmad Musthofa, M.Kom	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
163	190302311	Rizky, S.Kom., M.Kom.	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
164	190302277	Rokhmatullah Batik Firmansyah, S.Kom., M.Kom.	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
165	190302482	Vikky Aprelia Windarni, S.Kom., M.Cs	S1 Teknologi Informasi	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
166	190302197	Dhani Ariatmanto, S.Kom., M.Kom., Ph.D.	S2 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
167	190302052	Dr. Andi Sunyoto, S.Kom., M.Kom.	S2 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
168	190302004	Dr. Drs. Muhamad Idris Purwanto, M.M.	S2 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
169	190302060	Dr. Sri Ngudi Wahyuni, S.T., M.Kom.	S2 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
170	190302125	Emha Taufiq Luthfi, S.T., M.Kom., Ph.D.	S2 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
171	190302182	Tonny Hidayat, S.Kom., M.Kom., Ph.D.	S2 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
172	190302493	Alva Hendi Muhammad, A.Md., S.T., M.Eng., Ph.D.	S2 PJJ Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
173	190302024	Hanafi, S.Kom., M.Eng., Ph.D.	S2 PJJ Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
174	190302096	Hanif Al Fatta, S.Kom., M.Kom., Ph.D.	S2 PJJ Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
175	190302352	I Made Artha Agastya, S.T., M.Eng., Ph.D.	S2 PJJ Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
176	190302498	Raden Muhammad Agung Harimurti P., Dr., M.Kom	S2 PJJ Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
177	190302228	Robert Marco, S.T., M.T., Ph.D.	S2 PJJ Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
178	190302235	Dr. Ferry Wahyu Wibowo, S.Si., M.Cs.	S3 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
179	190302036	Prof. Arief Setyanto, S.Si., M.T., Ph.D.	S3 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
180	190302037	Prof. Dr. Ema Utami, S.Si., M.Kom.	S3 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
181	190302106	Prof. Dr. Kusrini, S.Kom., M.Kom.	S3 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
182	190302001	Prof. Dr. Mohammad Suyanto, M.M.	S3 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
184	190302359	Alfriadi Dwi Atmoko, S.E., Ak., M.Si.	S1 Akuntansi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
185	190302382	Edy Anan, S.E., M.Ak., Ak., CA	S1 Akuntansi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
186	190302295	Fahrul Imam Santoso, S.E., M.Akt.	S1 Akuntansi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
187	190302579	Irton, S.E, M.Si	S1 Akuntansi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
189	190302574	Uswatun Khasanah, S.Si, M.Pd.Si	S1 Akuntansi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
190	190302027	Widiyanti Kurnianingsih, S.E., M.Ak.	S1 Akuntansi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
191	190302520	Yola Andesta Valenty, S.E., M.Ak.	S1 Akuntansi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
192	190302307	Anggrismono, S.E., M.Ec.Dev.	S1 Ekonomi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
193	190302041	Anik Sri Widawati, S.Sos., M.M.	S1 Ekonomi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
194	190302366	Atika Fatimah, S.E., M.Ec.Dev.	S1 Ekonomi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
197	190302639	Dr. Moch. Hamied Wijaya, M.M	S1 Ekonomi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
198	190302333	Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev.	S1 Ekonomi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
199	190302021	Istiningsih, S.E., M.M.	S1 Ekonomi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
200	190302260	Sri Mulyatun, Dra.,M.M	S1 Ekonomi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
201	190302367	Aditya Maulana Hasymi, S.IP., M.A.	S1 Hubungan Internasional	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
202	190302577	Edy Musoffa, S.Ag, M.H	S1 Hubungan Internasional	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
203	190302731	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	S1 Hubungan Internasional	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
204	190302438	Muh. Ayub Pramana, S.H., M.H.	S1 Hubungan Internasional	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
205	190302323	Rezki Satris, S.I.P., M.A.	S1 Hubungan Internasional	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
207	190302695	Tunggul Wicaksono, S.I.P., M.A	S1 Hubungan Internasional	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
208	190302294	Yoga Suharman, S.IP., M.A.	S1 Hubungan Internasional	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
209	190302696	Yohanes William Santoso, S.Hub.Int., M.Hub.Int.	S1 Hubungan Internasional	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
212	190302522	Andreas Tri Pamungkas, S.Sos., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
213	190302339	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
214	190302661	Anggun Anindya Sekarningrum, M.I.Kom	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
215	190302627	Arrizqi Qonita Apriliana, S.I.Kom, M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
216	555200	Ayuni Fitria, S.Pd., M.A	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
218	190302655	Devi Wening Astari, M.I.Kom	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
219	190302363	Dr. Nurbayti, S.I.Kom., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
233	190302444	Kartika Sari Yudaninggar, S.I.Kom., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
225	190302443	Estiningsih, SE, MM	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
226	190302656	Etik Anjar Fitriarti, S.I.Kom., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
227	190302697	Feri Ludiyanto, S.Sn., M.Sn.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
229	190302673	Hermenegildus Agus Wibowo, S.S., M.Hum.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
231	190302445	Kadek Kiki Astria, S.I.Kom., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
236	190302571	Mulyadi Erman, S.Ag, MA	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
239	190302660	Raden Arditya Mutwara Lokita, M.I.Kom	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
240	190302475	Riski Damastuti, S.Sos., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
241	190302319	Rivga Agusta, S.I.P., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
242	190302266	Rosyidah Jayanti Vijaya, S.E, M.Hum	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
243	190302476	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
244	190302657	Rufki Ade Vinanda, S.I.Kom., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
245	190302437	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
246	190302364	Stara Asrita, S.I.Kom., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
247	190302506	Wajar Bimantoro Suminto, Sn., M.Des	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
248	190302477	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
270	190302340	Ani Hastuti Arthasari, S.T., M.Sc.	S1 Arsitektur	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
251	190302326	Agustina Rahmawati, S.A.P., M.Si.	S1 Ilmu Pemerintahan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
252	190302304	Ardiyati, S.I.P., M.P.A	S1 Ilmu Pemerintahan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
253	190302321	Ferri Wicaksono, S.I.P., M.A.	S1 Ilmu Pemerintahan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
254	190302316	Hanantyo Sri Nugroho, S.IP., M.A.	S1 Ilmu Pemerintahan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
255	190302042	Mei Maemunah, S.H., M.M.	S1 Ilmu Pemerintahan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
256	190302318	Muhammad Zuhdan, S.I.P., M.A.	S1 Ilmu Pemerintahan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
257	190302291	Ahmad Sumiyanto, SE, M.Si	S1 Kewirausahaan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
258	190302663	Dinda Sukmaningrum, S.T., M.M	S1 Kewirausahaan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
259	190302573	Dodi Setiawan R, S.Psi, MBA, Dr.	S1 Kewirausahaan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
260	190302587	Dr. Reza Widhar Pahlevi, S.E., M.M.	S1 Kewirausahaan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
262	190302334	Laksmindra Saptyawati, S.E., M.B.A.	S1 Kewirausahaan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
263	190302581	Narwanto Nurcahyo, SH, MM	S1 Kewirausahaan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
264	190302578	Nurhayanto, SE, MBA	S1 Kewirausahaan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
265	190302013	Rahma Widyawati, S.E., M.M.	S1 Kewirausahaan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
266	190302019	Suyatmi, S.E., M.M.	S1 Kewirausahaan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
268	190302308	Yusuf Amri Amrullah, S.E., M.M.	S1 Kewirausahaan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
271	190302621	Dr. Ir. Hamdi Buldan, M.T.	S1 Arsitektur	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
273	190302301	Prasetyo Febriarto, S.T., M.Sc.	S1 Arsitektur	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
274	190302309	Rhisa Aidilla Suprapto, S.T., M.Sc.	S1 Arsitektur	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
250	190302448	Zahrotus Sa'idah, S.I.Kom., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
220	190302360	Dwi Pela Agustina, S.I.Kom., M.A.	S1 Ilmu Komunikasi	FES	t	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
222	190302017	Eny Nurnilawati, S.E., M.M.	S1 Ilmu Komunikasi	FES	t	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
195	190302022	Dr. Achmad Fauzi, S.E., M.M.	S1 Ekonomi	FES	t	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
232	190302357	Kalis Purwanto, Dr, MM	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
267	190302303	Tanti Prita Hapsari, S.E., M.Si	S1 Kewirausahaan	FES	t	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
221	190302389	Dwiyono Iriyanto, Drs., M.M.	S1 Ilmu Komunikasi	FES	t	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
237	190302521	Novita Ika Purnama Sari, S.I.Kom., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
235	190302478	Monika Pretty Aprilia, S.I.P., M.Si.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
230	190302599	Junaidi, S.Ag., M.Hum, Dr.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	L	\N
234	190302672	Marita Nurharjanti, S.Pd., M.Pd	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	1
210	190302259	Achmad Fauzan., Dr., S.Psi., M.Psi., MM	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	1
275	190302292	Rr. Sophia Ratna Haryati, S.T., M.Sc.	S1 Arsitektur	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
276	190302310	Septi Kurniawati Nurhadi, S.T., M.T.	S1 Arsitektur	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
277	190302297	Afrinia Lisditya Permatasari, S.Si., M.Sc.	S1 Geografi	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
278	190302300	Dr. Ika Afianita Suherningtyas, S.Si., M.Sc.	S1 Geografi	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
279	190302674	Efrat Tegris, S.S., M.Pd	S1 Geografi	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
269	190302047	Amir Fatah Sofyan, S.T., M.Kom.	S1 Arsitektur	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
294	12345678	Dr. Purwo Andanu	S3 Informatika	FIK	t	2026-02-01 22:11:07.543666	2026-02-01 22:11:07.543666	f	\N	\N
27	190302682	Abd. Mizwar A. Rahim, M.Kom	S1 Informatika	FIK	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
183	555253	Agung Wijanarko, S.Sos, MM	S1 Akuntansi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
188	190302588	Sutarni, S.E., M.M.	S1 Akuntansi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
196	190302293	Dr. Ismadiyanti Purwaning Astuti, S.E., M.Sc.	S1 Ekonomi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
206	190302305	Seftina Kuswardini, S.IP., M.A.	S1 Hubungan Internasional	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
211	190302486	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
217	190302659	Bela Fataya Azmi, S.Kom.I., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
228	190302518	Haile Qudrat Djojodibroto, S.H., CMBA	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
238	190302435	Nurfian Yudhistira, S.I.Kom., M.A.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
249	190302485	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
261	190302713	Eny Ariyanto, S.E., M.Si., Dr.	S1 Kewirausahaan	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
272	190302324	Nurizka Fidali, S.T., M.Sc.	S1 Arsitektur	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
280	190302299	Fitria Nucifera, S.Si., M.Sc.	S1 Geografi	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
281	190302320	Fitria Nuraini Sekarsih, S.Si, M.Sc	S1 Geografi	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
282	190302302	Sadewa Purba Sejati, S.Si., M.Sc.	S1 Geografi	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
283	190302298	Vidyana Arsanti, S.Si., M.Sc.	S1 Geografi	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
284	190302338	Widiyana Riasasi, S.Si., M.Sc.	S1 Geografi	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
285	190302317	Bagus Ramadhan, S.T., M.Eng.	S1 Perencanaan Wilayah Kota	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
286	190302365	Gardyas Bidari Adninda, S.T., M.A.	S1 Perencanaan Wilayah Kota	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
287	190302729	Ibnul Muntaza, S.P.W.K., M.URP	S1 Perencanaan Wilayah Kota	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
288	190302730	Muhammad Najih Fasya, S.P.W.K., M.PAR.	S1 Perencanaan Wilayah Kota	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
289	190302383	Ni'mah Mahnunah, S.T., M.T.	S1 Perencanaan Wilayah Kota	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
290	190302370	Renindya Azizza Kartikakirana, S.T., M.Eng.	S1 Perencanaan Wilayah Kota	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
291	190302362	Rivi Neritarani, S.Si., M.Eng.	S1 Perencanaan Wilayah Kota	FST	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
224	190302107	Erik Hadi Saputra, S.Kom., M.Eng.	S1 Ilmu Komunikasi	FES	t	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	t	\N	\N
223	190302361	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	S1 Ilmu Komunikasi	FES	f	2026-02-01 13:07:15.757962	2026-02-01 13:07:15.757962	f	\N	\N
\.


--
-- Data for Name: libur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.libur (id, date, "time", room, reason, created_at, updated_at, nik, dosen_name) FROM stdin;
311	2026-02-18	\N	\N		2026-02-10 14:07:17.238042	2026-02-10 14:07:17.238042	190302521	\N
312	2026-02-19	\N	\N		2026-02-10 14:07:17.242957	2026-02-10 14:07:17.242957	190302521	\N
313	2026-02-20	\N	\N		2026-02-10 14:07:17.245969	2026-02-10 14:07:17.245969	190302521	\N
314	2026-02-25	\N	\N		2026-02-10 14:07:17.248849	2026-02-10 14:07:17.248849	190302521	\N
315	2026-02-26	\N	\N		2026-02-10 14:07:17.25343	2026-02-10 14:07:17.25343	190302521	\N
316	2026-02-27	\N	\N		2026-02-10 14:07:17.256431	2026-02-10 14:07:17.256431	190302521	\N
331	2026-02-18	\N	\N		2026-02-11 11:13:53.860427	2026-02-11 11:13:53.860427	190302476	\N
333	2026-02-20	\N	\N		2026-02-11 11:13:53.948009	2026-02-11 11:13:53.948009	190302476	\N
334	2026-02-23	\N	\N		2026-02-11 11:13:53.951508	2026-02-11 11:13:53.951508	190302476	\N
335	2026-02-25	\N	\N		2026-02-11 11:13:53.956492	2026-02-11 11:13:53.956492	190302476	\N
336	2026-02-26	\N	\N		2026-02-11 11:13:53.961694	2026-02-11 11:13:53.961694	190302476	\N
337	2026-02-27	\N	\N		2026-02-11 11:13:53.965286	2026-02-11 11:13:53.965286	190302476	\N
340	2026-02-27	\N	\N	Mohon dijadwalkan setelah jam 09.00 dan tidak dijadwalkan hari jumat	2026-02-11 11:14:39.213367	2026-02-11 11:14:39.213367	190302339	\N
342	2026-02-27	\N	\N	Tgl 19 & 27. Dan tidak bisa di jam 8.30	2026-02-11 11:17:22.077382	2026-02-11 11:17:22.077382	190302656	\N
344	\N	08:30	\N	tidak bisa pagi	2026-02-11 11:17:44.394546	2026-02-11 11:17:44.394546	190302656	\N
354	2026-02-19	\N	\N		2026-02-13 15:46:43.470032	2026-02-13 15:46:43.470032	190302573	\N
356	2026-02-26	\N	\N		2026-02-13 15:46:43.580131	2026-02-13 15:46:43.580131	190302573	\N
227	2026-02-18	\N	\N		2026-02-10 09:17:35.598412	2026-02-10 09:17:35.598412	190302305	\N
228	2026-02-19	\N	\N		2026-02-10 09:17:35.726849	2026-02-10 09:17:35.726849	190302305	\N
229	2026-02-26	\N	\N		2026-02-10 09:17:35.73129	2026-02-10 09:17:35.73129	190302305	\N
230	2026-02-18	\N	\N		2026-02-10 09:17:49.58682	2026-02-10 09:17:49.58682	190302367	\N
231	2026-02-18	\N	\N		2026-02-10 09:18:05.310943	2026-02-10 09:18:05.310943	190302588	\N
232	2026-02-20	\N	\N		2026-02-10 09:18:05.316036	2026-02-10 09:18:05.316036	190302588	\N
233	2026-02-18	\N	\N		2026-02-10 09:19:03.946928	2026-02-10 09:19:03.946928	190302476	\N
234	2026-02-19	\N	\N		2026-02-10 09:19:03.952004	2026-02-10 09:19:03.952004	190302476	\N
235	2026-02-20	\N	\N		2026-02-10 09:19:03.955042	2026-02-10 09:19:03.955042	190302476	\N
236	2026-02-23	\N	\N		2026-02-10 09:19:03.958097	2026-02-10 09:19:03.958097	190302476	\N
237	2026-02-25	\N	\N		2026-02-10 09:19:03.962512	2026-02-10 09:19:03.962512	190302476	\N
238	2026-02-26	\N	\N		2026-02-10 09:19:03.96692	2026-02-10 09:19:03.96692	190302476	\N
239	2026-02-27	\N	\N		2026-02-10 09:19:03.970093	2026-02-10 09:19:03.970093	190302476	\N
240	2026-02-18	\N	\N		2026-02-10 09:21:40.358748	2026-02-10 09:21:40.358748	190302476	\N
241	2026-02-19	\N	\N		2026-02-10 09:21:40.363824	2026-02-10 09:21:40.363824	190302476	\N
242	2026-02-20	\N	\N		2026-02-10 09:21:40.367006	2026-02-10 09:21:40.367006	190302476	\N
243	2026-02-23	\N	\N		2026-02-10 09:21:40.371865	2026-02-10 09:21:40.371865	190302476	\N
244	2026-02-25	\N	\N		2026-02-10 09:21:40.375307	2026-02-10 09:21:40.375307	190302476	\N
245	2026-02-26	\N	\N		2026-02-10 09:21:40.378427	2026-02-10 09:21:40.378427	190302476	\N
246	2026-02-27	\N	\N		2026-02-10 09:21:40.381391	2026-02-10 09:21:40.381391	190302476	\N
247	2026-02-18	\N	\N		2026-02-10 09:22:00.846752	2026-02-10 09:22:00.846752	190302657	\N
248	2026-02-19	\N	\N		2026-02-10 09:22:00.851703	2026-02-10 09:22:00.851703	190302657	\N
249	2026-02-20	\N	\N		2026-02-10 09:22:00.854794	2026-02-10 09:22:00.854794	190302657	\N
252	2026-02-23	\N	\N		2026-02-10 09:23:23.964013	2026-02-10 09:23:23.964013	190302366	\N
253	2026-02-24	\N	\N		2026-02-10 09:23:23.968749	2026-02-10 09:23:23.968749	190302366	\N
254	2026-02-25	\N	\N		2026-02-10 09:23:23.972014	2026-02-10 09:23:23.972014	190302366	\N
255	2026-02-26	\N	\N		2026-02-10 09:23:23.976635	2026-02-10 09:23:23.976635	190302366	\N
256	2026-02-27	\N	\N		2026-02-10 09:23:23.979696	2026-02-10 09:23:23.979696	190302366	\N
260	2026-02-18	\N	\N		2026-02-10 09:24:35.540696	2026-02-10 09:24:35.540696	190302478	\N
261	2026-02-19	\N	\N		2026-02-10 09:24:35.545731	2026-02-10 09:24:35.545731	190302478	\N
262	2026-02-20	\N	\N		2026-02-10 09:24:35.54905	2026-02-10 09:24:35.54905	190302478	\N
263	2026-02-23	\N	\N		2026-02-10 09:24:35.553024	2026-02-10 09:24:35.553024	190302478	\N
264	2026-02-25	\N	\N		2026-02-10 09:24:35.556511	2026-02-10 09:24:35.556511	190302478	\N
265	2026-02-26	\N	\N		2026-02-10 09:24:35.559737	2026-02-10 09:24:35.559737	190302478	\N
266	2026-02-27	\N	\N		2026-02-10 09:24:35.562768	2026-02-10 09:24:35.562768	190302478	\N
267	2026-02-18	\N	\N		2026-02-10 09:24:49.362284	2026-02-10 09:24:49.362284	190302013	\N
268	2026-02-19	\N	\N		2026-02-10 09:24:49.367613	2026-02-10 09:24:49.367613	190302013	\N
273	2026-02-24	\N	\N		2026-02-10 09:25:32.361451	2026-02-10 09:25:32.361451	190302333	\N
274	2026-02-25	\N	\N		2026-02-10 09:25:32.366866	2026-02-10 09:25:32.366866	190302333	\N
275	2026-02-26	\N	\N		2026-02-10 09:25:32.370391	2026-02-10 09:25:32.370391	190302333	\N
276	2026-02-18	\N	\N		2026-02-10 09:26:15.252682	2026-02-10 09:26:15.252682	190302333	\N
277	2026-02-19	\N	\N		2026-02-10 09:26:15.259144	2026-02-10 09:26:15.259144	190302333	\N
278	2026-02-20	\N	\N		2026-02-10 09:26:15.262173	2026-02-10 09:26:15.262173	190302333	\N
279	2026-02-23	\N	\N		2026-02-10 09:26:15.265343	2026-02-10 09:26:15.265343	190302333	\N
280	2026-02-27	\N	\N		2026-02-10 09:26:15.268342	2026-02-10 09:26:15.268342	190302333	\N
281	2026-02-20	\N	\N		2026-02-10 09:27:05.145564	2026-02-10 09:27:05.145564	190302713	\N
282	2026-02-26	\N	\N		2026-02-10 09:27:05.150546	2026-02-10 09:27:05.150546	190302713	\N
283	2026-02-27	\N	\N		2026-02-10 09:27:05.153576	2026-02-10 09:27:05.153576	190302713	\N
284	2026-02-23	\N	\N		2026-02-10 09:27:44.444073	2026-02-10 09:27:44.444073	190302298	\N
285	2026-02-24	\N	\N		2026-02-10 09:27:44.449071	2026-02-10 09:27:44.449071	190302298	\N
286	2026-02-26	\N	\N		2026-02-10 09:27:44.484955	2026-02-10 09:27:44.484955	190302298	\N
332	2026-02-19	\N	\N		2026-02-11 11:13:53.937209	2026-02-11 11:13:53.937209	190302476	\N
339	2026-02-20	\N	\N	Mohon dijadwalkan setelah jam 09.00 dan tidak dijadwalkan hari jumat	2026-02-11 11:14:39.176335	2026-02-11 11:14:39.176335	190302339	\N
341	2026-02-19	\N	\N	Tgl 19 & 27. Dan tidak bisa di jam 8.30	2026-02-11 11:17:22.036814	2026-02-11 11:17:22.036814	190302656	\N
345	\N	08:30	\N	tidak bisa pagi	2026-02-11 11:26:24.247261	2026-02-11 11:26:24.247261	190302339	\N
348	2026-02-19	\N	\N	sibuk kuliah	2026-02-12 14:23:00.587935	2026-02-12 14:23:00.587935	190302475	\N
349	2026-02-20	\N	\N	sibuk kuliah	2026-02-12 14:23:00.591408	2026-02-12 14:23:00.591408	190302475	\N
350	2026-02-23	\N	\N	sibuk kuliah	2026-02-12 14:23:00.594491	2026-02-12 14:23:00.594491	190302475	\N
305	2026-02-18	\N	\N		2026-02-10 14:06:35.822204	2026-02-10 14:06:35.822204	190302521	\N
306	2026-02-19	\N	\N		2026-02-10 14:06:35.826899	2026-02-10 14:06:35.826899	190302521	\N
307	2026-02-20	\N	\N		2026-02-10 14:06:35.829863	2026-02-10 14:06:35.829863	190302521	\N
308	2026-02-25	\N	\N		2026-02-10 14:06:35.832877	2026-02-10 14:06:35.832877	190302521	\N
309	2026-02-26	\N	\N		2026-02-10 14:06:35.837719	2026-02-10 14:06:35.837719	190302521	\N
310	2026-02-27	\N	\N		2026-02-10 14:06:35.840938	2026-02-10 14:06:35.840938	190302521	\N
351	2026-02-26	\N	\N	sibuk kuliah	2026-02-12 14:23:00.599039	2026-02-12 14:23:00.599039	190302475	\N
352	2026-02-27	\N	\N	sibuk kuliah	2026-02-12 14:23:00.60226	2026-02-12 14:23:00.60226	190302475	\N
353	2026-03-02	\N	\N	sibuk kuliah	2026-02-12 14:23:00.605413	2026-02-12 14:23:00.605413	190302475	\N
355	2026-02-23	\N	\N		2026-02-13 15:46:43.575063	2026-02-13 15:46:43.575063	190302573	\N
357	2026-03-02	\N	\N		2026-02-13 15:46:43.584291	2026-02-13 15:46:43.584291	190302573	\N
\.


--
-- Data for Name: mahasiswa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mahasiswa (id, nim, nama, prodi, pembimbing, created_at, updated_at, gender, penguji_1, penguji_2) FROM stdin;
1587	20.96.1734	WILLY ADRIEL PUTRA WARDANA	S1 Ilmu Komunikasi	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1588	21.96.2843	QAIS AS SYAFI'I	S1 Ilmu Komunikasi	Kadek Kiki Astria, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1589	22.96.3038	KORNELIA NOVASARI	S1 Ilmu Komunikasi	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1590	21.96.2712	ANDITYA AKBAR HERTANDI	S1 Ilmu Komunikasi	Devi Wening Astari, M.I.Kom	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1591	22.96.3551	DHESTA KURNIA ATANINGRUM	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1592	22.96.3174	AUREA CHERRISA DESIDERIA	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1593	19.96.1692	HANDY ALDIAWAN	S1 Ilmu Komunikasi	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1594	21.96.2337	THERESIA TAMARA HARYUNINGRUM	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1595	19.96.1281	TRIADINDA DEWI FORTUNA	S1 Ilmu Komunikasi	Nurfian Yudhistira, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1596	22.67.0059	VANIA NIDIA GANTARI	S1 Ilmu Komunikasi	Bela Fataya Azmi, S.Kom.I., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1597	22.96.3534	DIVANIA SOFIE MAYLINA PUTRI	S1 Ilmu Komunikasi	Novita Ika Purnama Sari, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1598	22.96.3370	FIQA SUCI ARFIA SAHARANI	S1 Ilmu Komunikasi	Bela Fataya Azmi, S.Kom.I., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1599	22.96.3316	FLADINTYA RACHEL ISLAMI	S1 Ilmu Komunikasi	Etik Anjar Fitriarti, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1600	21.96.2622	DANANG PRAMUDYA BAIHAQI	S1 Ilmu Komunikasi	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1601	22.96.2973	SINTIA AGUSTINA	S1 Ilmu Komunikasi	Novita Ika Purnama Sari, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1602	22.96.3518	RESTI KURNIAWATI	S1 Ilmu Komunikasi	Novita Ika Purnama Sari, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1603	21.96.2679	ILYAS SETYAWAN	S1 Ilmu Komunikasi	Monika Pretty Aprilia, S.I.P., M.Si.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1604	22.96.3292	SALMA FAIZ MAULIDA PUTRI	S1 Ilmu Komunikasi	Novita Ika Purnama Sari, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1605	22.96.3256	TERESA ESKAVI SONDA	S1 Ilmu Komunikasi	Novita Ika Purnama Sari, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1606	22.96.3271	OLGA NARADINDA	S1 Ilmu Komunikasi	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1609	22.96.3481	MUHAMMAD RAFI LAZUARDI	S1 Ilmu Komunikasi	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1610	22.96.3244	ALYA NURUL RAHMADINA	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1611	22.96.3155	SALSA BELA BUDI UTAMI	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1612	22.96.2941	NUUR ANGGRAINI KUSUMAAWATI	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1613	22.96.3206	ROSIDA AMALIA	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1615	22.96.3164	AULIA FREZA FITRIANI	S1 Ilmu Komunikasi	Bela Fataya Azmi, S.Kom.I., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1616	22.96.3215	PUTRI ENDINA EKA CAHYANI	S1 Ilmu Komunikasi	Bela Fataya Azmi, S.Kom.I., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1617	22.96.2899	KLAUDIA PUTRI AMELIA TANDI	S1 Ilmu Komunikasi	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1618	22.96.3140	SHAFIRA MAYLANI	S1 Ilmu Komunikasi	Etik Anjar Fitriarti, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1619	22.96.3398	ABIE DIKA BINTANG PUTRA	S1 Ilmu Komunikasi	Bela Fataya Azmi, S.Kom.I., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1621	22.96.3176	REVASYA ARNES ARIAMANDA	S1 Ilmu Komunikasi	Bela Fataya Azmi, S.Kom.I., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1622	22.96.3338	TANAYA MUTIARA NURDIANSYAH	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1623	20.96.2114	ALISHA LARASATI UTOMO	S1 Ilmu Komunikasi	Monika Pretty Aprilia, S.I.P., M.Si.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1624	22.96.3423	AULIA JASMIN HANIFAH	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1625	22.96.3386	DHIYA ULHAQ SAFINATUN NAJAH	S1 Ilmu Komunikasi	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1626	22.96.3396	SEPTIANA AKTHER PATWARY	S1 Ilmu Komunikasi	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1627	22.96.3391	GATHAN OKTARIANSYAH	S1 Ilmu Komunikasi	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1628	22.96.3275	WINDA AYU FITASARI	S1 Ilmu Komunikasi	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1629	22.96.3314	VERANIKA AULIA AGATHA	S1 Ilmu Komunikasi	Anggun Anindya Sekarningrum, M.I.Kom	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1630	21.96.2685	BAYU IRWANA	S1 Ilmu Komunikasi	Bela Fataya Azmi, S.Kom.I., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1632	21.96.2448	SHARLA PUTRI ARDHANA	S1 Ilmu Komunikasi	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1634	22.96.3430	HIJRIAH NURNANINGSIH	S1 Ilmu Komunikasi	Novita Ika Purnama Sari, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1636	22.96.3259	LAELA NURMALITA SARI	S1 Ilmu Komunikasi	Devi Wening Astari, M.I.Kom	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1637	22.96.3015	MEISHAFIRA PUTRI HERDANA	S1 Ilmu Komunikasi	Rufki Ade Vinanda, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1633	22.96.3326	HAIDAR KRESNA PAMUJI	S1 Ilmu Komunikasi	Anggun Anindya Sekarningrum, M.I.Kom	2026-02-11 23:01:48.744159	2026-02-11 23:08:20.071141	L	\N	\N
1607	22.96.3266	FADHILLA NUR FAJRIYAH	S1 Ilmu Komunikasi	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:08:38.648805	P	\N	\N
1635	22.96.3010	MUHAMMAD ARRASIT	S1 Ilmu Komunikasi	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:08:47.098916	L	\N	\N
1620	21.96.2700	ABU REIKHAN ALFARISI ZUFRI	S1 Ilmu Komunikasi	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:08:56.985799	L	\N	\N
1631	21.96.2629	MUHAMMAD FACHRIANSYAH	S1 Ilmu Komunikasi	Anggun Anindya Sekarningrum, M.I.Kom	2026-02-11 23:01:48.744159	2026-02-11 23:09:04.556656	L	\N	\N
6696	22.96.3090	Bima Samudra	S1 Ilmu Komunikasi	Rufki Ade Vinanda, S.I.Kom., M.A.	2026-02-12 14:01:57.035577	2026-02-12 14:01:57.035577	L	\N	\N
1639	22.96.3517	RAYHAN RACHMAN HAKIM	S1 Ilmu Komunikasi	Riski Damastuti, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1643	22.96.3058	PAULINA NIRMALA DANU	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1644	22.96.3603	SELSA KATRI EKADEWI	S1 Ilmu Komunikasi	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1645	22.96.3343	NAGITA DEVINA IMANDASARI	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1646	22.96.2955	FIKRI ZULKARNAIN	S1 Ilmu Komunikasi	Devi Wening Astari, M.I.Kom	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1647	22.96.3320	AGUSTINA STHELLA MEBANG	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1648	22.96.2944	AGUNG PANGESTU	S1 Ilmu Komunikasi	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1649	22.96.3133	CHEVINTA OTIS PARAMYTHA	S1 Ilmu Komunikasi	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1650	22.96.3154	MUHAMMAD BILLAL	S1 Ilmu Komunikasi	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1651	22.96.3274	ERLINA DWI NOERMA	S1 Ilmu Komunikasi	Rufki Ade Vinanda, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1652	22.96.3061	AKID SETYO RAHARJO	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1653	22.96.3000	AURELIUS FELIZ ERGI NATIVIDAD	S1 Ilmu Komunikasi	Etik Anjar Fitriarti, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1654	22.96.3268	DESINTA MAHARANI	S1 Ilmu Komunikasi	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1655	22.96.3357	AUDELINE PUTRI PRAMESYA	S1 Ilmu Komunikasi	Anggun Anindya Sekarningrum, M.I.Kom	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1657	22.96.3450	EMMIE LISTIANA	S1 Ilmu Komunikasi	Andreas Tri Pamungkas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1658	22.96.3455	FITRIANI	S1 Ilmu Komunikasi	Andreas Tri Pamungkas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1659	22.96.3443	FALAH RAHMAN KURNIASYAH	S1 Ilmu Komunikasi	Andreas Tri Pamungkas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1662	22.96.3199	EVANDRA HUDA PRADIPTA	S1 Ilmu Komunikasi	Zahrotus Sa'idah, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1663	22.96.2995	MELINDA KUSUMA PUTRI	S1 Ilmu Komunikasi	Riski Damastuti, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1664	22.96.3092	MUHAMMAD ALBAN	S1 Ilmu Komunikasi	Andreas Tri Pamungkas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1666	22.96.3161	AURA SYIFA NUR FADHILAH	S1 Ilmu Komunikasi	Etik Anjar Fitriarti, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1667	20.96.1853	IKHSANUL AMAL	S1 Ilmu Komunikasi	Novita Ika Purnama Sari, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1668	22.96.3571	ADILLA FITRIA SURYANI	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1669	22.96.3207	ERSANDA PUTRI MINA SETYORINI	S1 Ilmu Komunikasi	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1670	22.96.2902	RAIHAN ALHARITS	S1 Ilmu Komunikasi	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1672	22.96.2914	ANNISA MALIKA AKBAR	S1 Ilmu Komunikasi	Anggun Anindya Sekarningrum, M.I.Kom	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1673	22.96.3462	Irfan Gunawan	S1 Ilmu Komunikasi	Riski Damastuti, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1675	22.96.3079	Fidhal Fahruq Muadzlam Wahab	S1 Ilmu Komunikasi	Andreas Tri Pamungkas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1677	22.96.3440	Arsha Haroun Al Rasyid	S1 Ilmu Komunikasi	Andreas Tri Pamungkas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1678	22.96.3438	Puti Cinta Novtazulfa	S1 Ilmu Komunikasi	Andreas Tri Pamungkas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1679	22.96.3072	Gilang Kusuma Ramdani	S1 Ilmu Komunikasi	Andreas Tri Pamungkas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1681	22.96.3485	Annahda Djafniel Yudanur	S1 Ilmu Komunikasi	Riski Damastuti, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1682	21.96.2778	OCTAVIANA ADELLA PUTRI	S1 Ilmu Komunikasi	Kadek Kiki Astria, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1684	21.96.2858	DITA CAHYANINGRUM	S1 Ilmu Komunikasi	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1685	21.96.2662	Muhammad Irfan Firdaus Al Aqsha	S1 Ilmu Komunikasi	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1687	21.96.2608	Aimee Nuansa Azura R.	S1 Ilmu Komunikasi	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	P	\N	\N
1689	22.96.3277	Naufal Daffa Saputra	S1 Ilmu Komunikasi	Devi Wening Astari, M.I.Kom	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1660	22.96.3548	ANNISA ALWI SYAHIDAH	S1 Ilmu Komunikasi	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:06:31.281223	P	\N	\N
1665	22.96.3542	INTAN NURSANTI NUGROHO	S1 Ilmu Komunikasi	Anggun Anindya Sekarningrum, M.I.Kom	2026-02-11 23:01:48.744159	2026-02-11 23:06:42.832499	P	\N	\N
1640	22.96.3523	FIGO EKA PRADHIKA	S1 Ilmu Komunikasi	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:06:50.306432	L	\N	\N
1641	22.96.3497	ZA'IM MUTHAHARI	S1 Ilmu Komunikasi	Riski Damastuti, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:07:14.380951	L	\N	\N
1638	22.96.3483	MUHAMMAD FANDI NUR SETYWAN	S1 Ilmu Komunikasi	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:07:21.651351	L	\N	\N
1680	22.96.3456	Calvin Destyan Pradana	S1 Ilmu Komunikasi	Andreas Tri Pamungkas, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:07:33.195949	L	\N	\N
1683	22.96.3405	ANGELIA MAHARANI WIRAPUTERI	S1 Ilmu Komunikasi	Wajar Bimantoro Suminto, Sn., M.Des	2026-02-11 23:01:48.744159	2026-02-11 23:07:43.024669	P	\N	\N
1671	22.96.3371	BILQYSSA BIANCHA PUTRI RYANTI	S1 Ilmu Komunikasi	Anggun Anindya Sekarningrum, M.I.Kom	2026-02-11 23:01:48.744159	2026-02-11 23:07:58.946318	P	\N	\N
1686	22.96.3329	NOFIKASARI	S1 Ilmu Komunikasi	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:08:10.648702	P	\N	\N
1676	21.96.2268	HANUM ARI PRIHANDINI	S1 Ilmu Komunikasi	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:09:12.224166	P	\N	\N
1642	21.96.2614	NASYA AZZAHRA	S1 Ilmu Komunikasi	Etik Anjar Fitriarti, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:10:08.015298	P	Zahrotus Sa'idah, S.I.Kom., M.A.	\N
1688	19.96.1056	Muhammad Adib Fikri L	S1 Ilmu Komunikasi	Rivga Agusta, S.I.P., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:14:25.440242	L	Marita Nurharjanti, S.Pd., M.Pd	\N
1674	20.96.2209	Dhimas Arjuna Nur Kuncoro	S1 Ilmu Komunikasi	Rivga Agusta, S.I.P., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:14:58.284759	L	Achmad Fauzan., Dr., S.Psi., M.Psi., MM	\N
1690	20.96.2191	Wizza Ardha Kencana	S1 Ilmu Komunikasi	Riski Damastuti, S.Sos., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1691	21.96.2362	Muhammad Ibra Fahrezi	S1 Ilmu Komunikasi	Rivga Agusta, S.I.P., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1692	21.96.2656	RAYHAN DANI WICAKSONO	S1 Ilmu Komunikasi	Stara Asrita, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:01:48.744159	L	\N	\N
1656	22.96.3578	FAAIZ DAFFA FATHAN F.	S1 Ilmu Komunikasi	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:06:19.49245	L	\N	\N
1614	22.96.3378	FADHIL WINNES GALAEH PRATAMA	S1 Ilmu Komunikasi	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	2026-02-11 23:01:48.744159	2026-02-11 23:07:51.32961	L	\N	\N
1661	22.96.3325	RISTA PUTRI EKA PERTIWI	S1 Ilmu Komunikasi	Anggun Anindya Sekarningrum, M.I.Kom	2026-02-11 23:01:48.744159	2026-02-11 23:08:30.328412	P	\N	\N
1608	22.96.3337	VISHUNATAN JUNSI KRISTA PUTRA	S1 Ilmu Komunikasi	Etik Anjar Fitriarti, S.I.Kom., M.A.	2026-02-11 23:01:48.744159	2026-02-11 23:09:55.739592	L	Zahrotus Sa'idah, S.I.Kom., M.A.	\N
6698	22.96.3362	Sayu Farrah Bisawamila	S1 Ilmu Komunikasi	Rufki Ade Vinanda, S.I.Kom., M.A.	2026-02-12 14:01:57.035577	2026-02-12 14:01:57.035577	P	\N	\N
6699	22.96.2956	Yassar Ibni Maulana	S1 Ilmu Komunikasi	Devi Wening Astari, M.I.Kom	2026-02-12 14:01:57.035577	2026-02-12 14:01:57.035577	L	\N	\N
6700	21.96.2568	ERICKO WAKHID FITRIANTO	S1 Ilmu Komunikasi	Nurfian Yudhistira, S.I.Kom., M.A.	2026-02-12 14:01:57.035577	2026-02-12 14:01:57.035577	L	\N	\N
6701	21.96.2279	ALEXSANDER GENO	S1 Ilmu Komunikasi	Stara Asrita, S.I.Kom., M.A.	2026-02-12 14:01:57.035577	2026-02-12 14:01:57.035577	L	\N	\N
6702	22.96.3511	FITRIANI RAHMAN	S1 Ilmu Komunikasi	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	2026-02-12 14:01:57.035577	2026-02-12 14:01:57.035577	P	\N	\N
6703	20.96.1995	DAFA AZZAHRA PUTRA	S1 Ilmu Komunikasi	Kadek Kiki Astria, S.I.Kom., M.A.	2026-02-12 14:01:57.035577	2026-02-12 14:01:57.035577	L	\N	\N
6704	21.96.2635	Gakkoi Ardianta	S1 Ilmu Komunikasi	Nurfian Yudhistira, S.I.Kom., M.A.	2026-02-12 14:01:57.035577	2026-02-12 14:01:57.035577	L	\N	\N
6705	22.96.3261	Darin Fahriyal Merry	S1 Ilmu Komunikasi	Novita Ika Purnama Sari, S.I.Kom., M.A.	2026-02-12 14:01:57.035577	2026-02-12 14:01:57.035577	L	\N	\N
6706	22.96.3120	Muhammad Raihan Nur Fathiyya	S1 Ilmu Komunikasi	Riski Damastuti, S.Sos., M.A.	2026-02-12 14:01:57.035577	2026-02-12 14:01:57.035577	L	\N	\N
6707	22.96.3374	TASYA TIAS NUGRAHENI	S1 Ilmu Komunikasi	Devi Wening Astari, M.I.Kom	2026-02-12 14:01:57.035577	2026-02-12 14:01:57.035577	P	\N	\N
6708	20.96.2009	Nada Krisyifa Oktaviani	S1 Ilmu Komunikasi	Nurfian Yudhistira, S.I.Kom., M.A.	2026-02-12 14:01:57.035577	2026-02-12 14:01:57.035577	P	\N	\N
6695	20.96.1768	HERBAGAS BAGUS TARUNA	S1 Ilmu Komunikasi	Wajar Bimantoro Suminto, Sn., M.Des	2026-02-12 14:01:57.035577	2026-02-12 14:02:34.358806	L	\N	\N
6709	20.96.1804	Saif Arkan Arib Maulana	S1 Ilmu Komunikasi	Riski Damastuti, S.Sos., M.A.	2026-02-12 14:01:57.035577	2026-02-12 14:02:42.399259	L	\N	\N
6697	22.96.3319	RAFIFA AMALDHIA PUTRI	S1 Ilmu Komunikasi	Anggun Anindya Sekarningrum, M.I.Kom	2026-02-12 14:01:57.035577	2026-02-12 14:02:57.381297	P	\N	\N
6711	22.96.3445	RAKHA DAMONZA YODIANSYAH	S1 Ilmu Komunikasi	Andreas Tri Pamungkas, S.Sos., M.A.	2026-02-12 14:46:07.042376	2026-02-12 14:46:07.042376	L	\N	\N
6712	19.96.1077	RIZKI LEKSY REYNALDO	S1 Ilmu Komunikasi	Dr. Nurbayti, S.I.Kom., M.A.	2026-02-12 14:46:07.042376	2026-02-12 14:46:07.042376	L	\N	\N
6710	21.96.2502	Kolonius Octoviery Bayu Adwiandy Puryadi	S1 Ilmu Komunikasi	Anggun Anindya Sekarningrum, M.I.Kom	2026-02-12 14:46:07.042376	2026-02-12 14:46:20.559757	L	\N	\N
6713	21.96.2841	MUHAMMAD FAIZ JORDAN	S1 Ilmu Komunikasi	Riski Damastuti, S.Sos., M.A.	2026-02-12 14:46:07.042376	2026-02-12 14:46:27.994541	L	\N	\N
6714	22.96.3547	MUHAMMAD NAWAWI MUDA SEMIRI	S1 Ilmu Komunikasi	Wajar Bimantoro Suminto, Sn., M.Des	2026-02-12 15:31:59.196091	2026-02-12 15:31:59.196091	L	\N	\N
6715	21.85.0151	Rifki Wahyu Pratama	S1 Geografi	Widiyana Riasasi, S.Si., M.Sc.	2026-02-12 15:48:33.595511	2026-02-12 15:48:33.595511	L	Fitria Nuraini Sekarsih, M.Sc.	Vidyana Arsanti, M.Sc.
6716	21.85.0157	Hadam Cahya Ramadhan	S1 Geografi	Widiyana Riasasi, S.Si., M.Sc.	2026-02-12 15:48:33.595511	2026-02-12 15:48:33.595511	L	Dr. Ika Afianita S., M. Sc.	Sadewa Purba Sejati, M. Sc.
6717	22.85.0173	KUKUH	S1 Geografi	Fitria Nuraini Sekarsih, S.Si, M.Sc	2026-02-12 15:48:33.595511	2026-02-12 15:48:33.595511	L	Sadewa Purba Sejati, M. Sc.	Dr. Ika Afianita S., M. Sc.
6718	22.85.1177	Alif Ridwan Ariyanto	S1 Geografi	Sadewa Purba Sejati, S.Si., M.Sc.	2026-02-12 15:48:33.595511	2026-02-12 15:48:33.595511	L	Widiyana Riasasi, S.Si., M.Sc.	Vidyana Arsanti, M.Sc.
6719	22.86.0271	Adelia Wulandari	S1 Perencanaan Wilayah Kota	Ni'mah Mahnunah, S.T., M.T.	2026-02-12 15:55:14.93481	2026-02-12 15:55:14.93481	P	Bagus Ramadhan, S.T., M.Eng.	Renindya Azizza Kartikakirana, S.T., M.Eng.
6720	22.86.0273	Nur Mayangsari	S1 Perencanaan Wilayah Kota	Gardyas Bidari Adninda, S.T., M.A.	2026-02-12 15:55:14.93481	2026-02-12 15:55:14.93481	P	Renindya Azizza Kartikakirana, S.T., M.Eng.	Bagus Ramadhan, S.T., M.Eng.
6721	22.86.0224	Wiwin Royani Umasugi	S1 Perencanaan Wilayah Kota	Renindya Azizza Kartikakirana, S.T., M.Eng.	2026-02-12 15:55:14.93481	2026-02-12 15:55:14.93481	P	Rivi Neritarani, S.Si., M.Eng.	Gardyas Bidari Adninda, S.T., M.A.
6722	22.86.0233	Vrisna Nabilla	S1 Perencanaan Wilayah Kota	Gardyas Bidari Adninda, S.T., M.A.	2026-02-12 15:55:14.93481	2026-02-12 15:55:14.93481	P	Ni'mah Mahnunah, S.T., M.T.	Bagus Ramadhan, S.T., M.Eng.
6723	21.86.0216	Claudia Indasari Jena	S1 Perencanaan Wilayah Kota	Bagus Ramadhan, S.T., M.Eng.	2026-02-12 15:55:14.93481	2026-02-12 15:55:14.93481	P	Ni'mah Mahnunah, S.T., M.T.	Renindya Azizza Kartikakirana, S.T., M.Eng.
6724	22.86.0237	Audyna Listiyo Wati	S1 Perencanaan Wilayah Kota	Rivi Neritarani, S.Si., M.Eng.	2026-02-12 15:55:14.93481	2026-02-12 15:55:14.93481	P	Gardyas Bidari Adninda, S.T., M.A.	Ni'mah Mahnunah, S.T., M.T.
6725	19.92.0211	algaffary dnio rahmadian	S1 Kewirausahaan	Suyatmi, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Laksmindra Saptyawati, S.E., M.B.A.	Mei Maemunah, S.H., M.M.
6727	22.92.0442	Gustiano Aditya Gunawan	S1 Kewirausahaan	Yusuf Amri Amrullah, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Dr. Dodi Setiawan Riatmaja, S.Psi., M.B.A.	Rahma Widyawati, S.E., M.M.
6728	22.92.0428	MUNAA KHOIRUL UMAM	S1 Kewirausahaan	Yusuf Amri Amrullah, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Rahma Widyawati, S.E., M.M.	Suyatmi, S.E., M.M.
6729	22.92.0471	Maranti Suryaningsih	S1 Kewirausahaan	Dr. Reza Widhar Pahlevi, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Dr. Dodi Setiawan Riatmaja, S.Psi., M.B.A.	Laksmindra Saptyawati, S.E., M.B.A.
6730	22.92.0447	Muhammad Zaidan Hasaniputra	S1 Kewirausahaan	Dr. Reza Widhar Pahlevi, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Dinda Sukmaningrum, S.T., M.M	Yusuf Amri Amrullah, S.E., M.M.
6731	22.92.0468	PAULINA ANUGRAHNI	S1 Kewirausahaan	Dinda Sukmaningrum, S.T., M.M	2026-02-12 16:00:19.285086	2026-02-13 11:10:00.871256	\N	Yusuf Amri Amrullah, S.E., M.M.	Dr. Reza Widhar Pahlevi, S.E., M.M.
6726	22.92.0466	Faiz Karima	S1 Kewirausahaan	Yusuf Amri Amrullah, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-13 11:10:18.11206	\N	Laksmindra Saptyawati, S.E., M.B.A.	Dodi Setiawan R, S.Psi, MBA, Dr.
6792	20.96.1794	Novita Anggraeni	S1 Ilmu Komunikasi	Riski Damastuti, S.Sos., M.A.	2026-02-13 12:28:48.872503	2026-02-13 12:28:48.872503	P	\N	\N
6732	22.92.0460	DIMAS RIZKY TRISAKTI PB	S1 Kewirausahaan	Suyatmi, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Narwanto Nurcahyo, S.H., M.M.	Dinda Sukmaningrum, S.T., M.M
6733	22.92.0433	VEMAS ALVITO SIGARSIA	S1 Kewirausahaan	Suyatmi, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Nurhayanto, S.E., M.B.A.	Rahma Widyawati, S.E., M.M.
6734	22.92.0477	ELSA VIYANA SARI	S1 Kewirausahaan	Rahma Widyawati, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Laksmindra Saptyawati, S.E., M.B.A.	Nurhayanto, S.E., M.M.
6735	22.92.0459	Siva Aulia Sekar Langit	S1 Kewirausahaan	Dinda Sukmaningrum, S.T., M.M	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Dr. Reza Widhar Pahlevi, S.E., M.M.	Nurhayanto, S.E., M.B.A.
6736	22.92.0490	UMI KHABIBAH	S1 Kewirausahaan	Rahma Widyawati, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Narwanto Nurcahyo, S.H, M.M.	Laksmindra Saptyawati, S.E., M.B.A.
6738	20.92.0226	Wisnu Jati Nugroho	S1 Kewirausahaan	Dinda Sukmaningrum, S.T., M.M	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Suyatmi, S.E., M.M.	Laksmindra Saptyawati, S.E., M.B.A.
6740	22.92.0473	INDAH KESIANA DEWI	S1 Kewirausahaan	Suyatmi, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Laksmindra Saptyawati, S.E., M.B.A.	Nurhayanto, S.E., M.B.A.
6741	20.92.0295	Radenroro Nilam Sophia Puti Dayu	S1 Kewirausahaan	Eny Ariyanto, S.E., M.Si., Dr.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Dr. Reza Widhar Pahlevi, S.E., M.M.	Yusuf Amri Amrullah, S.E., M.M.
6742	22.92.0438	SEPTIAN HERU KURNIAWAN	S1 Kewirausahaan	Rahma Widyawati, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Suyatmi, S.E., M.M.	Mei Maemunah, S.H., M.M.
6743	22.92.0443	INTAN ANINDITA NURBAITI	S1 Kewirausahaan	Rahma Widyawati, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Yusuf Amri Amri Amrullah, S.E., M.M.	Laksmindra Saptyawati, S.E., M.B.A.
6744	21.92.0404	PENI HANA ZUSTIKA	S1 Kewirausahaan	Eny Ariyanto, S.E., M.Si., Dr.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Dinda Sukmaningrum, S.T., M.M	Dr. Reza Widhar Pahlevi, S.E., M.M.
6745	21.92.0363	A RIZAL E SOALOON LUBIS	S1 Kewirausahaan	Yusuf Amri Amrullah, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Narwanto Nurcahyo, S.H., M.M.	Dr. Dodi Setiawan Riatmaja, S.Psi., M.B.A.
6746	22.92.0469	MELANI SALSABILA	S1 Kewirausahaan	Yusuf Amri Amrullah, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Dr. Dodi Setiawan Riatmaja, S.Psi., M.B.A.	Nurhayanto, S.E., M.B.A.
6747	22.92.0448	Mayra Putri Juliana	S1 Kewirausahaan	Laksmindra Saptyawati, S.E., M.B.A.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Dinda Sukmaningrum, S.T., M.M	Dr. Dodi Setiawan Riatmaja, S.Psi., M.B.A.
6748	22.92.0439	ALVIAN WAHYU TSANI	S1 Kewirausahaan	Laksmindra Saptyawati, S.E., M.B.A.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Dr. Reza Widhar Pahlevi, S.E., M.M.	Nurhayanto, S.H., M.B.A.
6749	20.92.0256	HAFIFUDDIN	S1 Kewirausahaan	Dodi Setiawan R, S.Psi, MBA, Dr.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Suyatmi, S.E., M.M.	Rahma Widyawati, S.E., M.M.
6750	22.92.0465	Haifa Nafillah Kholda	S1 Kewirausahaan	Yusuf Amri Amrullah, S.E., M.M.	2026-02-12 16:00:19.285086	2026-02-12 16:00:19.285086	\N	Narwanto Nurcahyo, S.H., M.M.	Nurhayanto, S.E., M.B.A.
6739	20.92.0282	Melati Sekar Waditra	S1 Kewirausahaan	Eny Ariyanto, S.E., M.Si., Dr.	2026-02-12 16:00:19.285086	2026-02-12 16:01:57.007826	\N	Dr. Reza Widhar Pahlevi, S.E., M.M.	Dinda Sukmaningrum, S.T., M.M
6767	19.95.0146	SILVIA DEWI RAMAWATI	S1 Hubungan Internasional	Seftina Kuswardini, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:32:24.957573	\N	Aditya Maulana Hasymi, S.IP., M.A.	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.
6737	21.92.0325	Muhammad Rifqi Pratama	S1 Kewirausahaan	Dinda Sukmaningrum, S.T., M.M	2026-02-12 16:00:19.285086	2026-02-12 16:03:14.589097	\N	Suyatmi, S.E., M.M.	Narwanto Nurcahyo, SH, MM
6751	19.93.0113	Oktaviani Dwi Puspita	S1 Akuntansi	Widiyanti Kurnianingsih, S.E., M.Ak.	2026-02-13 01:27:59.65972	2026-02-13 01:27:59.65972	\N	Fahrul Imam Santoso, S.E., M.Akt.	Irton, S.E, M.Si
6752	21.93.0242	Arif Bagus Pramudi	S1 Akuntansi	Yola Andesta Valenty, S.E., M.Ak.	2026-02-13 01:27:59.65972	2026-02-13 01:27:59.65972	\N	Edy Anan, S.E., M.Ak., Ak., CA	Sutarni, S.E., M.M.
6753	22.93.0322	BERLIAN ABELITA HENDRAWATI	S1 Akuntansi	Edy Anan, S.E., M.Ak., Ak., CA	2026-02-13 01:27:59.65972	2026-02-13 01:27:59.65972	\N	Fahrul Imam Santoso, S.E., M.Akt.	Yola Andesta Valenty, S.E., M.Ak.
6754	19.93.0121	MARCELINO FIRDAUS	S1 Akuntansi	Sutarni, S.E., M.M.	2026-02-13 01:27:59.65972	2026-02-13 01:27:59.65972	\N	Fahrul Imam Santoso, S.E., M.Akt.	Irton, S.E, M.Si
6755	21.93.0251	RADEN USMAN NUZQI RAMADHAN	S1 Akuntansi	Sutarni, S.E., M.M.	2026-02-13 01:27:59.65972	2026-02-13 01:27:59.65972	\N	Edy Anan, S.E., M.Ak., Ak., CA	Yola Andesta Valenty, S.E., M.Ak.
6756	22.95.0392	Aisyah Ahlaqul Alexandra Setiawan	S1 Hubungan Internasional	Yoga Suharman, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Yohanes William Santoso, M.Hub.Int.	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.
6757	21.95.0311	FARSYA MAHARANI	S1 Hubungan Internasional	Yoga Suharman, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Aditya Maulana Hasymi, S.IP., M.A.	Yohanes William Santoso, M.Hub.Int.
6758	19.95.0163	ENJELITHA	S1 Hubungan Internasional	Seftina Kuswardini, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Aditya Maulana Hasymi, S.IP., M.A.	Yohanes William Santoso, M.Hub.Int.
6759	22.95.0410	INDAH DWI RAHMAWATI	S1 Hubungan Internasional	Seftina Kuswardini, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Yohanes William Santoso, M.Hub.Int.	Aditya Maulana Hasymi, S.IP., M.A.
6760	20.95.0238	Tri Utami	S1 Hubungan Internasional	Yoga Suharman, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	Yohanes William Santoso, M.Hub.Int.
6761	19.95.0175	Julian Agung Prasetyo	S1 Hubungan Internasional	Seftina Kuswardini, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Aditya Maulana Hasymi, S.IP., M.A.	Yohanes William Santoso, M.Hub.Int.
6762	19.95.0176	LALU M. ALFAN SAORI	S1 Hubungan Internasional	Yoga Suharman, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Seftina Kuswardini, S.IP., M.A.	Yohanes William Santoso, M.Hub.Int.
6763	20.95.0239	Feronika Dian Fatihah	S1 Hubungan Internasional	Aditya Maulana Hasymi, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Seftina Kuswardini, S.IP., M.A.	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.
6764	20.95.0209	NUR ISA MELIYANTI	S1 Hubungan Internasional	Aditya Maulana Hasymi, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Yohanes William Santoso, M.Hub.Int.	Seftina Kuswardini, S.IP., M.A.
6765	22.95.0406	Muizmu Sallajul Iqbal	S1 Hubungan Internasional	Yoga Suharman, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	Yohanes William Santoso, M.Hub.Int.
6766	20.95.0244	Rendry Rahama Sulaga	S1 Hubungan Internasional	Seftina Kuswardini, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Aditya Maulana Hasymi, S.IP., M.A.	Yohanes William Santoso, M.Hub.Int.
6768	22.95.0354	YOSEP KURNIAWAN	S1 Hubungan Internasional	Aditya Maulana Hasymi, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	Yohanes William Santoso, M.Hub.Int.
6769	22.95.0432	Salma Semesta	S1 Hubungan Internasional	Yoga Suharman, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	Seftina Kuswardini, S.IP., M.A.
6770	20.95.0203	Mya kustanti	S1 Hubungan Internasional	Aditya Maulana Hasymi, S.IP., M.A.	2026-02-13 01:31:29.554598	2026-02-13 01:31:29.554598	\N	Seftina Kuswardini, S.IP., M.A.	Laksmindra Saptyawati, S.E., M.B.A.
6771	22.94.0301	Sahirah Nur Hanifah	S1 Ilmu Pemerintahan	Hanantyo Sri Nugroho, S.IP., M.A.	2026-02-13 01:41:09.358782	2026-02-13 01:41:09.358782	\N	Mei Maemunah, S.H., M.M.	Agustina Rahmawati, S.A.P., M.Si.
6772	22.94.0280	AZZAHRA NUR OKTAVIANA	S1 Ilmu Pemerintahan	Hanantyo Sri Nugroho, S.IP., M.A.	2026-02-13 01:41:09.358782	2026-02-13 01:41:09.358782	\N	Ferri Wicaksono, S.I.P., M.A.	Muhammad Zuhdan, S.I.P., M.A.
6773	21.94.0241	Zidan Alfi Kautsar	S1 Ilmu Pemerintahan	Ardiyati, S.I.P., M.P.A	2026-02-13 01:41:09.358782	2026-02-13 01:41:09.358782	\N	Mei Maemunah, S.H., M.M.	Agustina Rahmawati, S.A.P., M.Si.
6774	22.94.0308	FIORELIA CHAIRUNNISA CHANDRA	S1 Ilmu Pemerintahan	Hanantyo Sri Nugroho, S.IP., M.A.	2026-02-13 01:41:09.358782	2026-02-13 01:41:09.358782	\N	Muhammad Zuhdan, S.I.P., M.A.	Ferri Wicaksono, S.I.P., M.A.
6775	22.94.0295	Elita Zena Pratista Arta Mulia	S1 Ilmu Pemerintahan	Ardiyati, S.I.P., M.P.A	2026-02-13 01:41:09.358782	2026-02-13 01:41:09.358782	\N	Mei Maemunah, S.H., M.M.	Agustina Rahmawati, S.A.P., M.Si.
6776	22.94.0264	Rizka Sakti Eka Pambudi	S1 Ilmu Pemerintahan	Hanantyo Sri Nugroho, S.IP., M.A.	2026-02-13 01:41:09.358782	2026-02-13 01:41:09.358782	\N	Ferri Wicaksono, S.I.P., M.A.	Muhammad Zuhdan, S.I.P., M.A.
6778	22.94.0246	JESICHA MANDHANCE AURRELIA MAHA DEWIE	S1 Ilmu Pemerintahan	Muhammad Zuhdan, S.I.P., M.A.	2026-02-13 01:41:09.358782	2026-02-13 01:41:09.358782	\N	Ferri Wicaksono, S.I.P., M.A.	Hanantyo Sri Nugroho, S.IP., M.A.
6779	22.94.0243	Angistiya Pinakesti	S1 Ilmu Pemerintahan	Ferri Wicaksono, S.I.P., M.A.	2026-02-13 01:41:09.358782	2026-02-13 01:41:09.358782	\N	Ardiyati, S.I.P., M.P.A	Agustina Rahmawati, S.A.P., M.Si.
6780	22.94.0289	Herlina Handastari	S1 Ilmu Pemerintahan	Ferri Wicaksono, S.I.P., M.A.	2026-02-13 01:41:09.358782	2026-02-13 01:41:09.358782	\N	Muhammad Zuhdan, S.I.P., M.A.	Hanantyo Sri Nugroho, S.IP., M.A.
6781	22.94.0285	Lovisa Veranica	S1 Ilmu Pemerintahan	Ferri Wicaksono, S.I.P., M.A.	2026-02-13 01:41:09.358782	2026-02-13 01:41:09.358782	\N	Muhammad Zuhdan, S.I.P., M.A.	Hanantyo Sri Nugroho, S.IP., M.A.
6782	22.94.0284	Sukma Karunia Alam	S1 Ilmu Pemerintahan	Muhammad Zuhdan, S.I.P., M.A.	2026-02-13 01:41:09.358782	2026-02-13 01:41:09.358782	\N	Hanantyo Sri Nugroho, S.IP., M.A.	Ferri Wicaksono, S.I.P., M.A.
6777	22.94.0296	Vina Aliya Farhatayni	S1 Ilmu Pemerintahan	Mei Maemunah, S.H., M.M.	2026-02-13 01:41:09.358782	2026-02-13 01:41:52.796443	\N	Ardiyati, S.I.P., M.P.A	Agustina Rahmawati, S.A.P., M.Si.
6783	22.91.0258	Sophia Myska Amira	S1 Ekonomi	Atika Fatimah, S.E., M.Ec.Dev.	2026-02-13 01:42:00.002181	2026-02-13 01:42:00.002181	\N	Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev.	Anik Sri Widawati, S.Sos., M.M.
6784	22.91.0261	Nagisa Zanura	S1 Ekonomi	Atika Fatimah, S.E., M.Ec.Dev.	2026-02-13 01:42:00.002181	2026-02-13 01:42:00.002181	\N	Anggrismono, S.E., M.Ec.Dev.	Dra. Sri Mulyatun., M.M
6785	22.91.0276	Fitri Ramadhani	S1 Ekonomi	Dr. Ismadiyanti Purwaning Astuti, S.E., M.Sc.	2026-02-13 01:42:00.002181	2026-02-13 01:42:00.002181	\N	Anik Sri Widawati, S.Sos., M.M.	Atika Fatimah, S.E., M.Ec.Dev.
6786	22.91.0233	Vara Fadila Agustin	S1 Ekonomi	Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev.	2026-02-13 01:42:00.002181	2026-02-13 01:42:00.002181	\N	Anggrismono, S.E., M.Ec.Dev.	Istiningsih, S.E., M.M.
6787	22.91.0249	Sherly Anggiliana Puspitasari	S1 Ekonomi	Anik Sri Widawati, S.Sos., M.M.	2026-02-13 01:42:00.002181	2026-02-13 01:42:00.002181	\N	Dr. Ismadiyanti Purwaning Astuti, S.E., M.Sc.	Anggrismono, S.E., M.Ec.Dev.
6788	21.91.0203	Muhammad Muadz Albaihaqi	S1 Ekonomi	Anik Sri Widawati, S.Sos., M.M.	2026-02-13 01:42:00.002181	2026-02-13 01:42:00.002181	\N	Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev.	Istiningsih, S.E., M.M.
6789	22.91.0228	Futiara Aturrohmah	S1 Ekonomi	Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev.	2026-02-13 01:42:00.002181	2026-02-13 01:42:00.002181	\N	Dra. Sri Mulyatun., M.M	Istiningsih, S.E., M.M.
6790	19.91.0105	Robet Harjiyanto Rastamaji	S1 Ekonomi	Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev.	2026-02-13 01:42:00.002181	2026-02-13 01:42:00.002181	\N	Dr. Ismadiyanti Purwaning Astuti, S.E., M.Sc.	Atika Fatimah, S.E., M.Ec.Dev.
6791	21.91.0186	BAGAS KURNIAWAN	S1 Ekonomi	Istiningsih, S.E., M.M.	2026-02-13 11:16:21.694677	2026-02-13 11:16:21.694677	L	Atika Fatimah, S.E., M.Ec.Dev.	Anik Sri Widawati, S.Sos., M.M.
\.


--
-- Data for Name: master_dosen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.master_dosen (id, nik, nama, status, kategori, nidn, jenis_kelamin, created_at, updated_at) FROM stdin;
3	190302001	Prof. Dr. Mohammad Suyanto, M.M.	DOSEN	Dosen Karyawan	0520026001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
4	190302004	Dr. Drs. Muhamad Idris Purwanto, M.M.	DOSEN	Dosen Tetap Khusus	0503066001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
5	190302011	Ir. Rum Mohamad Andri K Rasyid, M.Kom.	DOSEN	Dosen Karyawan	0521076702	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
6	190302012	Agung Pambudi, S.T., M.A.	DOSEN	Dosen Karyawan	0512126503	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
7	190302013	Rahma Widyawati, S.E., M.M.	DOSEN	Dosen Karyawan	0522026702	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
8	190302017	Eny Nurnilawati, S.E., M.M.	DOSEN	Dosen Karyawan	0519057102	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
9	190302019	Suyatmi, S.E., M.M.	DOSEN	Dosen Karyawan	0531127101	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
10	190302021	Istiningsih, S.E., M.M.	DOSEN	Dosen Karyawan	0521076901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
11	190302022	Dr. Achmad Fauzi, S.E., M.M.	DOSEN	Dosen Karyawan	0514106702	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
12	190302024	Hanafi, S.Kom., M.Eng., Ph.D.	DOSEN	Dosen Karyawan	0519127303	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
13	190302027	Widiyanti Kurnianingsih, S.E., M.Ak.	DOSEN	Dosen Karyawan	0503086601	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
14	190302029	Drs. Bambang Sudaryatno, M.M.	DOSEN	Dosen Freelance	0505096001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
15	190302031	Aryanto Yuniawan, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0518067701	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
16	190302035	Sudarmawan, S.T., M.T.	DOSEN	Dosen Karyawan	0512047201	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
17	190302036	Prof. Arief Setyanto, S.Si., M.T., Ph.D.	DOSEN	Dosen Karyawan	0522077501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
18	190302037	Prof. Dr. Ema Utami, S.Si., M.Kom.	DOSEN	Dosen Karyawan	0521027501	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
19	190302038	Krisnawati, S.Si., M.T.	DOSEN	Dosen Karyawan	0505057501	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
20	190302039	Yudi Sutanto, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0505077501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
21	190302041	Anik Sri Widawati, S.Sos., M.M.	DOSEN	Dosen Karyawan	0515077302	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
22	190302042	Mei Maemunah, S.H., M.M.	DOSEN	Dosen Karyawan	0508057401	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
23	190302047	Amir Fatah Sofyan, S.T., M.Kom.	DOSEN	Dosen Karyawan	0519076901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
24	190302052	Dr. Andi Sunyoto, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0507027701	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
25	190302057	Heri Sismoro, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0523057401	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
26	190302060	Dr. Sri Ngudi Wahyuni, S.T., M.Kom.	DOSEN	Dosen Karyawan	0511127701	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
27	190302066	Nur Aini, A.Md., S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0520067901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
28	190302068	Jaeni , S.Kom., M.Eng.	DOSEN	Dosen Karyawan	0523077601	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
29	190302096	Hanif Al Fatta, S.Kom., M.Kom., Ph.D.	DOSEN	Dosen Karyawan	0517027901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
30	190302098	Muhammad Rudyanto Arief, S.T., M.T	DOSEN	Dosen Karyawan	0518037801	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
31	190302105	Melwin Syafrizal, S.Kom., M.Eng., Ph.D.	DOSEN	Dosen Karyawan	0511057202	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
32	190302106	Prof. Dr. Kusrini, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0513127901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
33	190302107	Erik Hadi Saputra, S.Kom., M.Eng.	DOSEN	Dosen Karyawan	0501117801	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
34	190302108	Mardhiya Hayaty, S.T., M.Kom.	DOSEN	Dosen Tetap Fulltime	0527077801	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
35	190302109	Andika Agus Slameto, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0522088001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
36	190302110	Tristanto Ariaji, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0507048001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
37	190302112	Kusnawi, S.Kom., M.Eng.	DOSEN	Dosen Karyawan	0528097501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
38	190302115	Tri Susanto, M.Kom	DOSEN	Dosen Tetap Khusus	0526077801	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
39	190302125	Emha Taufiq Luthfi, S.T., M.Kom., Ph.D.	DOSEN	Dosen Karyawan	0524067901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
40	190302126	Barka Satya, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0505067902	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
41	190302128	Dr. Dony Ariyus, S.S., M.Kom.	DOSEN	Dosen Karyawan	0524037901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
42	190302146	Yuli Astuti, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0521018302	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
43	190302148	Ahlihi Masruro, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0519067602	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
44	190302150	Arif Dwi Laksito, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0529098202	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
45	190302151	Lukman, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0505128101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
46	190302152	Drs. Asro Nasiri, M.Kom.	DOSEN	Dosen Karyawan	0407106704	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
47	190302154	Devi Wulandari, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0526078501	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
48	190302156	Tahajudin Sudibyo, Drs. M.A	DOSEN	Dosen Tetap Khusus	9990643154	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
49	190302159	Kamarudin, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0525038203	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
50	190302161	Nila Feby Puspitasari, S.Kom., M.Cs.	DOSEN	Dosen Tetap Fulltime	0510118101	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
51	190302163	Anggit Dwi Hartanto, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0513098601	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
52	190302164	Bhanu Sri Nugraha, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0530048001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
53	190302174	Akhmad Dahlan , S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0514078401	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
54	190302181	Joko Dwi Santoso, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0511038302	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
55	190302182	Tonny Hidayat, S.Kom., M.Kom., Ph.D.	DOSEN	Dosen Karyawan	0524088501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
56	190302185	Windha Mega Pradnya Dhuhita, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0517038501	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
57	190302187	Mei Parwanto Kurniawan, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0512058501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
58	190302192	Ali Mustopa, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0512108501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
59	190302197	Dhani Ariatmanto, S.Kom., M.Kom., Ph.D.	DOSEN	Dosen Tetap Fulltime	0527028001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
60	190302208	Raditya Wardhana, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0527078603	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
61	190302209	Azis Catur Laksono, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0519018701	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
62	190302215	Rizqi Sukma Kharisma, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0511068701	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
63	190302216	Bayu Setiaji, M.Kom.	DOSEN	Dosen Tetap Fulltime	0526048401	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
64	190302226	Dr. Emigawaty, M.Kom	DOSEN	Dosen Tetap Khusus	0206087501	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
1	12345678	Dr. Purwo Andanu	DOSEN	Dosen Tetap		L	2026-02-01 22:20:37.544632	2026-02-01 22:20:37.544632
65	190302227	Eli Pujastuti, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0524078901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
66	190302228	Robert Marco, S.T., M.T., Ph.D.	DOSEN	Dosen Karyawan	0510048202	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
67	190302229	Agus Purwanto, A.Md., S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0618118002	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
68	190302230	Hastari Utama, S.Kom., M.Cs.	DOSEN	Dosen Karyawan	0520058701	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
69	190302231	Erni Seniwati, S.Kom, M.Cs	DOSEN	Dosen Tetap Khusus	0109118101	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
70	190302232	Dr. Hartatik, S.T., M.Cs.	DOSEN	Dosen Tetap Fulltime	0506018401	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
71	190302235	Dr. Ferry Wahyu Wibowo, S.Si., M.Cs.	DOSEN	Dosen Karyawan	0521058101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
72	190302236	Dwi Nurani, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0519088901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
73	190302237	Ike Verawati, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0512118802	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
74	190302238	Acihmah Sidauruk, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0505078701	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
75	190302239	Supriatin, A.Md., S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0515108801	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
76	190302240	Alfie Nur Rahmi, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0522088801	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
77	190302242	Agung Nugroho, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0524088801	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
78	190302243	Bernadhed, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0514028702	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
79	190302244	Hendra Kurniawan, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0529108901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
80	190302245	Norhikmah, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0512108901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
81	190302246	Rumini, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0521058702	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
82	190302248	Mulia Sulistiyono, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0525118601	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
83	190302249	Agus Fatkhurohman, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0519088902	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
84	190302250	Dina Maulina, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0517018201	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
85	190302251	Satya Abdul Halim Bahtiar, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
86	190302253	Donni Prabowo, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0518128901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
87	190302254	Bety Wulan Sari, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0507019201	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
88	190302255	Ainul Yaqin, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0511119001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
89	190302256	Sumarni Adi, S.Kom., M.Cs.	DOSEN	Dosen Karyawan	0512068602	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
90	190302257	Netci Hesvindrati, SE, M.Kom	DOSEN	Dosen Tetap Khusus	0517097901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
91	190302258	Wiji Nurastuti, S.E., M.T.	DOSEN	Dosen Tetap Khusus	0520067801	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
92	190302259	Achmad Fauzan., Dr., S.Psi., M.Psi., MM	DOSEN	Dosen Tetap Khusus	0523116702	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
93	190302260	Sri Mulyatun, Dra.,M.M	DOSEN	Dosen Tetap Khusus	0513027201	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
94	190302266	Rosyidah Jayanti Vijaya, S.E, M.Hum	DOSEN	Dosen Tetap Khusus	0520097202	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
95	190302268	Ika Nur Fajri, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0525058602	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
96	190302270	Andriyan Dwi Putra, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0526079001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
97	190302271	Yogi Piskonata, S.S, M.Kom	DOSEN	-	0517036801	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
98	190302272	Wiwi Widayani, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0619028301	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
99	190302276	Ferian Fauzi Abdulloh, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0511029001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
100	190302277	Rokhmatullah Batik Firmansyah, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0522089001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
101	190302278	Nuri Cahyono, M.Kom.	DOSEN	Dosen Karyawan	0513039101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
102	190302281	Muhammad Tofa Nurcholis, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0526078901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
103	190302282	Ikmah, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0515019201	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
104	190302284	Moch Farid Fauzi, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0501088701	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
105	190302285	Sharazita Dyah Anggita, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0526118801	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
106	190302286	Haryoko, S.Kom., M.Cs.	DOSEN	Dosen Karyawan	0510038602	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
107	190302287	Arif Akbarul Huda, S.Si., M.Eng.	DOSEN	Dosen Karyawan	0506058901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
108	190302288	Lilis Dwi Farida, S.Kom., M.Eng.	DOSEN	Dosen Karyawan	0503088602	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
109	190302289	Arifiyanto Hadinegoro, S.Kom., M.T.	DOSEN	Dosen Karyawan	0513018701	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
110	190302290	Anna Baita, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0517098801	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
111	190302291	Ahmad Sumiyanto, SE, M.Si	DOSEN	-	0508067002	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
112	190302292	Rr. Sophia Ratna Haryati, S.T., M.Sc.	DOSEN	Dosen Tetap Fulltime	0525058303	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
113	190302293	Dr. Ismadiyanti Purwaning Astuti, S.E., M.Sc.	DOSEN	Dosen Tetap Fulltime	0514088601	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
114	190302294	Yoga Suharman, S.IP., M.A.	DOSEN	Dosen Tetap Fulltime	0518108502	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
115	190302295	Fahrul Imam Santoso, S.E., M.Akt.	DOSEN	Dosen Karyawan	0517058801	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
116	190302297	Afrinia Lisditya Permatasari, S.Si., M.Sc.	DOSEN	Dosen Tetap Fulltime	0501058604	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
117	190302298	Vidyana Arsanti, S.Si., M.Sc.	DOSEN	Dosen Tetap Fulltime	0502058604	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
118	190302299	Fitria Nucifera, S.Si., M.Sc.	DOSEN	Dosen Karyawan	0529049002	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
119	190302300	Dr. Ika Afianita Suherningtyas, S.Si., M.Sc.	DOSEN	Dosen Tetap Fulltime	0502018902	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
120	190302301	Prasetyo Febriarto, S.T., M.Sc.	DOSEN	Dosen Tetap Fulltime	0506028402	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
121	190302302	Sadewa Purba Sejati, S.Si., M.Sc.	DOSEN	Dosen Tetap Fulltime	0525018702	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
122	190302303	Tanti Prita Hapsari, S.E., M.Si	DOSEN	Dosen Tetap Fulltime	0518058302	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
123	190302304	Ardiyati, S.I.P., M.P.A	DOSEN	Dosen Tetap Fulltime	0525078101	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
124	190302305	Seftina Kuswardini, S.IP., M.A.	DOSEN	Dosen Karyawan	0506088801	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
125	190302307	Anggrismono, S.E., M.Ec.Dev.	DOSEN	Dosen Tetap Fulltime	0524028101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
126	190302308	Yusuf Amri Amrullah, S.E., M.M.	DOSEN	Dosen Tetap Fulltime	0518048702	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
127	190302309	Rhisa Aidilla Suprapto, S.T., M.Sc.	DOSEN	Dosen Tetap Fulltime	0520108602	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
128	190302310	Septi Kurniawati Nurhadi, S.T., M.T.	DOSEN	Dosen Tetap Fulltime	0504099001	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
129	190302311	Rizky, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0529098803	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
130	190302312	Senie Destya, S.T., M.Kom.	DOSEN	Dosen Tetap Fulltime	0524129001	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
131	190302315	Firman Asharudin, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0527039002	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
132	190302316	Hanantyo Sri Nugroho, S.IP., M.A.	DOSEN	Dosen Tetap Fulltime	0509048902	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
133	190302317	Bagus Ramadhan, S.T., M.Eng.	DOSEN	Dosen Karyawan	0517049002	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
134	190302318	Muhammad Zuhdan, S.I.P., M.A.	DOSEN	Dosen Tetap Fulltime	0511048201	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
135	190302319	Rivga Agusta, S.I.P., M.A.	DOSEN	Dosen Karyawan	0518089102	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
136	190302320	Fitria Nuraini Sekarsih, S.Si, M.Sc	DOSEN	Dosen Tetap Khusus	0510038603	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
137	190302321	Ferri Wicaksono, S.I.P., M.A.	DOSEN	Dosen Karyawan	0531108802	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
138	190302322	Khoirunnisa Cahya Firdani, SE, M.Si	DOSEN	-	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
139	190302323	Rezki Satris, S.I.P., M.A.	DOSEN	Dosen Tetap Fulltime	0528048801	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
140	190302324	Nurizka Fidali, S.T., M.Sc.	DOSEN	Dosen Tetap Fulltime	0502058003	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
141	190302326	Agustina Rahmawati, S.A.P., M.Si.	DOSEN	Dosen Tetap Fulltime	0621089101	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
142	190302327	Banu Santoso, A.Md., S.T., M.Eng.	DOSEN	Dosen Tetap Fulltime	0506017801	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
143	190302328	Wahyu Sukestyastama Putra, S.T., M.Eng.	DOSEN	Dosen Tetap Fulltime	0511069101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
144	190302329	Irma Rofni Wulandari, S.Pd., M.Eng.	DOSEN	Dosen Tetap Fulltime	0515039001	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
145	190302330	Ninik Tri Hartanti, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0505067901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
146	190302332	Muhammad Fairul Filza, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0504098603	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
147	190302333	Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev.	DOSEN	Dosen Karyawan	0522058503	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
148	190302334	Laksmindra Saptyawati, S.E., M.B.A.	DOSEN	Dosen Karyawan	0505038101	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
149	190302335	Rina Pramitasari, S.Si., M.Cs.	DOSEN	Dosen Tetap Fulltime	0525068601	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
150	190302338	Widiyana Riasasi, S.Si., M.Sc.	DOSEN	Dosen Tetap Fulltime	0520018901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
151	190302339	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	DOSEN	Dosen Tetap Fulltime	1015018501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
152	190302340	Ani Hastuti Arthasari, S.T., M.Sc.	DOSEN	Dosen Karyawan	0503088004	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
153	190302345	Niken Larasati, S.Kom, M.Eng	DOSEN	Dosen Tetap Khusus	0514119102	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
154	190302348	Aditya Rizki Yudiantika, S.T., M.Eng	DOSEN	Dosen Tetap Khusus	0518038902	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
155	190302350	Dwi Miyanto, S.ST., M.T	DOSEN	Dosen Tetap Khusus	0519058401	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
156	190302351	Afrig Aminuddin, S.Kom., M.Eng., Ph.D.	DOSEN	Dosen Tetap Fulltime	0512089201	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
157	190302352	I Made Artha Agastya, S.T., M.Eng., Ph.D.	DOSEN	Dosen Tetap Fulltime	0523088802	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
158	190302354	Atik Nurmasani, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0515019202	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
159	190302356	Agit Amrullah, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0510089101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
160	190302357	Kalis Purwanto, Dr, MM	DOSEN	Dosen Tetap Khusus	0506036001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
161	190302359	Alfriadi Dwi Atmoko, S.E., Ak., M.Si.	DOSEN	Dosen Tetap Fulltime	0526059301	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
162	190302360	Dwi Pela Agustina, S.I.Kom., M.A.	DOSEN	Dosen Tetap Fulltime	0520088901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
163	190302361	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	DOSEN	Dosen Tetap Fulltime	0517129201	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
164	190302362	Rivi Neritarani, S.Si., M.Eng.	DOSEN	Dosen Tetap Fulltime	0502048901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
165	190302363	Dr. Nurbayti, S.I.Kom., M.A.	DOSEN	Dosen Tetap Fulltime	0504048702	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
166	190302364	Stara Asrita, S.I.Kom., M.A.	DOSEN	Dosen Tetap Fulltime	0509069101	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
167	190302365	Gardyas Bidari Adninda, S.T., M.A.	DOSEN	Dosen Tetap Fulltime	0501049201	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
168	190302366	Atika Fatimah, S.E., M.Ec.Dev.	DOSEN	Dosen Tetap Fulltime	0519088903	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
169	190302367	Aditya Maulana Hasymi, S.IP., M.A.	DOSEN	Dosen Tetap Fulltime	0514059201	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
170	190302370	Renindya Azizza Kartikakirana, S.T., M.Eng.	DOSEN	Dosen Tetap Fulltime	0528129002	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
171	190302375	Theopilus Bayu Sasongko, S.Kom., M.Eng.	DOSEN	Dosen Tetap Fulltime	0627029001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
172	190302376	Afiuddin Ahmadi, S.T.	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
173	190302380	Ermambang Bendung Wijaya, S.Sn	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
174	190302381	Dida Karisma, S.Kom	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
175	190302382	Edy Anan, S.E., M.Ak., Ak., CA	DOSEN	-	0510107302	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
176	190302383	Ni'mah Mahnunah, S.T., M.T.	DOSEN	Dosen Tetap Fulltime	0523118801	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
177	190302386	S. L Harjanta, S.IP, M.Si	DOSEN	-	0520058003	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
178	190302387	Raditya Maulana Anuraga, M.Kom	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
179	190302388	Elita Ariani, A.Md	DOSEN	-	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
180	190302389	Dwiyono Iriyanto, Drs., M.M.	DOSEN	Dosen Tetap Khusus	0512016201	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
181	190302390	Ibnu Hadi Purwanto, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0524119201	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
182	190302391	Ika Asti Astuti, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0515089301	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
183	190302392	Rifda Faticha Alfa Aziza, S.Kom., M.Kom.	DOSEN	Dosen Karyawan	0518129301	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
184	190302393	Majid Rahardi, S.Kom., M.Eng.	DOSEN	Dosen Karyawan	0524119202	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
185	190302394	Emil haryanto, S.E., ME	DOSEN	Dosen Tetap Fulltime	0519067001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
186	190302395	Widhiarta, M.Kom	DOSEN	-	0506088501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
187	190302398	Wahyu Sudarmawan, SE., SH., M.Si	DOSEN	-	0512036801	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
188	190302400	El Johan Kristama, S.Kom	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
189	190302402	Ari Kusmiatun, Dr	DOSEN	-	0015077806	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
190	190302407	Toto Indriyatmoko, M.Kom	DOSEN	Dosen Tetap Khusus	0513099201	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
191	190302408	M. Nuraminudin, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0506099301	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
192	190302409	Pramudhita Ferdiansyah, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0516028502	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
193	190302412	Yoga Pristyanto, S.Kom., M.Eng.	DOSEN	Dosen Tetap Fulltime	0514049301	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
194	190302413	Subektiningsih, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0530058902	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
195	190302415	Irwan Setiawanto, S.Kom, M.Eng	DOSEN	Dosen Tetap Khusus	0502108901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
196	190302418	Muzakki Ahmad, M.Kom	DOSEN	Dosen Tetap Khusus	0522069101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
197	190302419	Uyock Anggoro Saputro, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0521048702	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
198	190302420	Juarisman, M.Kom	DOSEN	-	0523128403	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
199	190302421	Ifraweri Raja Mangkuto HP, S. Pd., M.Kom	DOSEN	-	0510027201	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
200	190302422	Maulana Brama Shandy, S.Kom	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
201	190302424	Lalu Agam Pramdya Syalabi, M.Kom	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
202	190302425	Nur Widjiyati, M.Kom	DOSEN	Dosen Tetap Khusus	0521107702	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
203	190302426	Rafsanjani Arroisi, S.IKom	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
204	190302427	Dhimas Adi Satria, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0501109301	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
205	190302428	Rahmi Arifiana Dewi, S.Si	DOSEN	-	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
206	190302429	Dewi Nur Indahsari Esti Rahayu, S.Si, MM	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
207	190302430	Sunar Handari, S.Pd	DOSEN	-	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
208	190302431	Halimatus Sadiyah, M.I.Kom	DOSEN	-	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
209	190302432	Hans Hermang Mintana, S.Sos, M.A	DOSEN	-	0516128301	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
210	190302433	Dwi Nurrahmi Kusumastuti, M.I.Kom	DOSEN	-	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
211	190302434	Susari Nugraheni, S.S, M. Sc	DOSEN	-	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
212	190302435	Nurfian Yudhistira, S.I.Kom., M.A.	DOSEN	Dosen Tetap Fulltime	0521119101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
213	190302437	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	DOSEN	Dosen Tetap Fulltime	0521059201	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
214	190302438	Muh. Ayub Pramana, S.H., M.H.	DOSEN	Dosen Tetap Khusus	0528056203	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
215	190302439	Hennry Poerwanto B, Ir, MM, M.Kom	DOSEN	Dosen Freelance	0001065602	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
216	190302443	Estiningsih, SE, MM	DOSEN	Dosen Tetap Khusus	0520106801	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
217	190302444	Kartika Sari Yudaninggar, S.I.Kom., M.A.	DOSEN	Dosen Tetap Fulltime	0509029101	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
218	190302445	Kadek Kiki Astria, S.I.Kom., M.A.	DOSEN	Dosen Tetap Fulltime	0515038901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
219	190302448	Zahrotus Sa'idah, S.I.Kom., M.A.	DOSEN	Dosen Tetap Fulltime	2109059003	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
220	190302452	Wahid Miftahul Ashari, S.Kom., M.T.	DOSEN	Dosen Tetap Fulltime	0514129002	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
221	190302453	Fredi Satya Candra Rosaji, S.Si., M.Sc	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
222	190302454	Muhammad Koprawi, S.Kom., M.Eng.	DOSEN	Dosen Tetap Fulltime	0506019201	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
223	190302455	Melany Mustika Dewi, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0526079301	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
224	190302456	Jeki Kuswanto, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0526059501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
225	190302457	Dwi Rahayu, S.Kom., M.Kom	DOSEN	Dosen Tetap Khusus	0501029501	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
226	190302458	Ria Andriani, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0531129401	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
227	190302459	Ahmad Sa`di, S.Kom, M.Eng	DOSEN	-	0513039002	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
228	190302460	Sri Ekodoso Noworini, Dra., M.Hum	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
229	190302461	Desi Hernila, S.Psi., MA	DOSEN	-	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
230	190302462	Ali Sofwan, Dr., SE., M.Si., CAAT	DOSEN	Dosen Freelance	0609017301	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
231	190302463	Khairullah Zikri, S.Ag., M.A., St. Rel	DOSEN	Dosen Freelance	2025057401	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
232	190302464	Siti Khuzaimah, S.Th.I.,M.A	DOSEN	-	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
233	190302465	M. Akbar Maulana, M.Kom	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
234	190302467	Ahmad Zaid Rahman, M.Kom	DOSEN	Dosen Tetap Khusus	0518039701	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
235	190302469	Ardian Yuligar Safagi, S.Kom	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
236	190302470	M. Syaiful Anam, S.Kom	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
237	190302471	Krisharyono, M.Sn	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
238	190302472	Hernandes Saranela, S.Sn	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
239	190302475	Riski Damastuti, S.Sos., M.A.	DOSEN	Dosen Tetap Fulltime	0525058803	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
240	190302476	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	DOSEN	Dosen Tetap Fulltime	0503098602	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
241	190302477	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	DOSEN	Dosen Tetap Fulltime	0528078903	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
242	190302478	Monika Pretty Aprilia, S.I.P., M.Si.	DOSEN	Dosen Tetap Fulltime	0526048503	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
243	190302480	Anggit Ferdita Nugraha, S.T., M.Eng.	DOSEN	Dosen Tetap Fulltime	0525029301	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
244	190302481	Surya Tri Atmaja Ramadhani, S.Kom.,M.Eng	DOSEN	Dosen Tetap Khusus	0525048903	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
245	190302482	Vikky Aprelia Windarni, S.Kom., M.Cs	DOSEN	Dosen Tetap Khusus	0523049301	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
246	190302483	Dewi Anisa Istiqomah, S.Pd., M.Cs	DOSEN	Dosen Tetap Khusus	0522019201	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
247	190302484	Bayu Nadya Kusuma, S.T., M.Eng	DOSEN	Dosen Tetap Khusus	0505028902	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
248	190302485	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	DOSEN	Dosen Tetap Fulltime	0518079301	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
249	190302486	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	DOSEN	Dosen Tetap Fulltime	0502109001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
250	190302491	Eko Rahmat Slamet Hidayat Saputra, M.Kom	DOSEN	Dosen Tetap Khusus	0517129501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
251	190302492	Mujiyanto, M.Kom	DOSEN	Dosen Tetap Fulltime	0515109301	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
252	190302493	Alva Hendi Muhammad, A.Md., S.T., M.Eng., Ph.D.	DOSEN	Dosen Tetap Fulltime	0518078401	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
253	190302494	Ade Pujianto, M.Kom	DOSEN	Dosen Tetap Khusus	0521049501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
254	190302495	Arvin C Frobenius, S.Kom., M.Kom.	DOSEN	Dosen Tetap Fulltime	0508109302	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
255	190302497	Muhammad Misbahul Munir, M.Kom	DOSEN	Dosen Tetap Khusus	0530069401	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
256	190302498	Raden Muhammad Agung Harimurti P., Dr., M.Kom	DOSEN	Dosen Tetap Khusus	8884011019	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
257	190302499	Yuniar Istiyani, S.IP., M.Sc	DOSEN	-	0509068001	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
258	190302500	Anggit Tiyas Fitra Romadani, M.Pd	DOSEN	Dosen Freelance	0519039101	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
259	190302501	Halim Bayu Aji Sumarna, S.Kom	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
260	190302502	Winarja, S.Kom	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
261	190302503	Hary Budianto, S.Pd	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
262	190302504	Imam Ainudin Pirmansah, M.Kom	DOSEN	Dosen Tetap Khusus	0504059401	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
263	190302505	Demi Lidya Landau, S.Pd., M.Hum	DOSEN	-	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
264	190302506	Wajar Bimantoro Suminto, Sn., M.Des	DOSEN	Dosen Tetap Khusus	0303047703	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
265	190302507	Winda Sekar Dewi, M.Kom	DOSEN	-	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
266	190302509	Herda Dicky Ramandita, M.Kom	DOSEN	Dosen Freelance	0518068702	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
267	190302510	Weka Kusumastiti, M.Pd.	DOSEN	Dosen Freelance	0518128703	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
268	190302513	Najib Cahyo Aji, S.Ds	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
269	190302514	Budi Setiawan, S.Kom	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
270	190302516	Jalu Trangga Laksita, S.Kom	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
271	190302517	Aryo Wiryawan, S.T	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
272	190302518	Haile Qudrat Djojodibroto, S.H., CMBA	DOSEN	-	0501028503	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
273	190302519	Yeni Wulandari, S.S., M.A.	DOSEN	Dosen Freelance	0504068501	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
274	190302520	Yola Andesta Valenty, S.E., M.Ak.	DOSEN	Dosen Tetap Fulltime	0504119302	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
275	190302521	Novita Ika Purnama Sari, S.I.Kom., M.A.	DOSEN	Dosen Tetap Fulltime	0526118902	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
276	190302522	Andreas Tri Pamungkas, S.Sos., M.A.	DOSEN	Dosen Tetap Fulltime	0503068602	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
277	190302524	Nafiatun Sholihah, S,Kom., M.Cs	DOSEN	Dosen Tetap Khusus	0506129001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
278	190302526	Novi Prisma Yunita, M.Kom	DOSEN	Dosen Tetap Khusus	0516119201	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
279	190302534	Reisita Monica Astrid Cintha, M.A	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
280	190302547	Andre Kussuma Adiputra, SE, M.Si	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
281	190302548	Auliya Shoffi, SE, M.Ak	DOSEN	Dosen Freelance	9905005316	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
282	190302549	Muhammad Sofyan Indrajaya, SE, M.Acc	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
283	190302550	Dedy Hariyadi, ST, M.Kom	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
284	190302551	Nadea Cipta Laksmita, M.Kom	DOSEN	Dosen Tetap Khusus	0504109601	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
285	190302552	Rifai Ahmad Musthofa, M.Kom	DOSEN	Dosen Tetap Khusus	0508079501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
286	190302553	Hamid Muzaki, MM	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
287	190302554	Miski, SHI, M.Sos	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
288	190302555	I Gede Eka Susanto, ST, MM	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
289	190302556	Theresia Sumartini, SIP, MPA	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
290	190302557	Sugiyatno, S.Kom, M.Kom	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
291	190302558	Hana Nimashita, M.A	DOSEN	Dosen Freelance	0002027901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
292	190302559	Patisina, Dr., ST., M.Eng.	DOSEN	Dosen Freelance	1030127901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
293	190302561	Elin Nur Rachmawati, M.Pd	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
294	190302564	Yoga Darmajati, M.Sc	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
295	190302565	Annisa Hertami Kusumastuti Yudhomo, M.Sn	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
296	190302566	Dr. Ari Sulistyo, S.Pd, M.Sc	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
297	190302567	Komang Aryasa, S.Kom.,M.T	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
298	190302568	Erfan Hasmin, S.Kom, M.T	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
299	190302569	Rismayani, S.Kom, MT	DOSEN	Dosen Freelance	0908048702	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
300	190302570	M. Syukri Mustafa, S.Si.,MMSI	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
301	190302571	Mulyadi Erman, S.Ag, MA	DOSEN	Dosen Tetap Khusus	0520037201	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
302	190302573	Dodi Setiawan R, S.Psi, MBA, Dr.	DOSEN	Dosen Tetap Khusus	0505088303	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
303	190302574	Uswatun Khasanah, S.Si, M.Pd.Si	DOSEN	Dosen Tetap Khusus	0518128201	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
304	190302575	Dr. Kumara Ari Yuana, ST, MT	DOSEN	Dosen Tetap Khusus	0515067101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
305	190302577	Edy Musoffa, S.Ag, M.H	DOSEN	Dosen Tetap Khusus	0525026902	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
306	190302578	Nurhayanto, SE, MBA	DOSEN	Dosen Tetap Khusus	0528096901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
307	190302579	Irton, S.E, M.Si	DOSEN	Dosen Tetap Khusus	0502026403	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
308	190302580	Eko Pramono, S.Si, M.T	DOSEN	Dosen Tetap Khusus	0522067101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
309	190302581	Narwanto Nurcahyo, SH, MM	DOSEN	Dosen Tetap Khusus	0509076301	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
310	190302582	Stevi Ema Wijayanti, M.Kom	DOSEN	Dosen Tetap Khusus	0519039001	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
311	190302584	Lia Ayu Ivanjelita, M.Kom	DOSEN	Dosen Tetap Fulltime	0528069101	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
312	190302585	Rizki Tri Puji Wanggono, M.Kom	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
313	190302587	Dr. Reza Widhar Pahlevi, S.E., M.M.	DOSEN	Dosen Tetap Khusus	0501119001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
314	190302588	Sutarni, S.E., M.M.	DOSEN	Dosen Tetap Fulltime	0206078301	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
315	190302590	Fadeyanto Prabowo, S.Sos, M.A	DOSEN	Dosen Freelance	0510128502	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
316	190302591	Fernan Rahadi, S.I.P., M.A.	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
317	190302592	Latifaestrelita Indi Pramesti Aji, S.Kom	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
318	190302593	Reny Triwardani, M.A	DOSEN	Dosen Freelance	0510058401	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
319	190302594	Rizky Fauziah, M.Kom, M.Ikom	DOSEN	Dosen Freelance	0112039501	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
320	190302595	Muhammad Manar Barmawi, Ak., M.Ak.	DOSEN	Dosen Freelance	0519047602	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
321	190302597	Artha Tri Hastutiningsih, S.Kom, MM	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
322	190302598	Ira Ida Yustina, S.Pd, M.Pd	DOSEN	Dosen Freelance	0518077602	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
323	190302599	Junaidi, S.Ag., M.Hum, Dr.	DOSEN	Dosen Tetap Khusus	0504077201	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
324	190302601	Adrianto Mahendra Wijaya, S.Si, MT	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
325	190302602	Yesaya Tommy Paulus, S.Kom., MT., Ph.D	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
326	190302618	Bahrun Ghozali, S.Kom., M.Kom	DOSEN	Dosen Tetap Fulltime	0510079001	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
327	190302621	Dr. Ir. Hamdi Buldan, M.T.	DOSEN	Dosen Tetap Khusus	0508057002	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
328	190302622	Hendry Sugara, S.Pd., M.Pd.	DOSEN	Dosen Freelance	0408049101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
329	190302623	Oktafiani Herlina, S.S., M.A	DOSEN	Dosen Freelance	0504108201	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
330	190302624	Agus Susanto S.Pd., M.I.Kom	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
331	190302625	Dewa Made Budi Swardana,S.E., M.M.	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
332	190302626	Dr. Irsasri, M.Pd,	DOSEN	Dosen Freelance	0623078501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
333	190302627	Arrizqi Qonita Apriliana, S.I.Kom, M.A.	DOSEN	Dosen Tetap Khusus	0529049601	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
334	190302630	Dessy Riana Sari, S.Pd, M.Kom	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
335	190302631	Afifah Nur Aini, M.Kom	DOSEN	Dosen Tetap Khusus	0519049602	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
336	190302639	Dr. Moch. Hamied Wijaya, M.M	DOSEN	Dosen Tetap Khusus	0512076703	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
337	190302643	Achmad Djunaedi, Ir., MUP., Ph.D., Prof	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
338	190302645	Dian Utami, SE, M.Ak, CLI, CPA	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
339	190302652	Buyut Khoirul Umri, M.Kom	DOSEN	Dosen Tetap Khusus	0529119701	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
340	190302653	Yoga Sahria, S.Kom., M.Kom., Ir., Dr.	DOSEN	Dosen Tetap Khusus	0511079501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
341	190302655	Devi Wening Astari, M.I.Kom	DOSEN	Dosen Tetap Khusus	0503048803	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
342	190302656	Etik Anjar Fitriarti, S.I.Kom., M.A.	DOSEN	Dosen Tetap Khusus	0530039302	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
343	190302657	Rufki Ade Vinanda, S.I.Kom., M.A.	DOSEN	Dosen Tetap Khusus	0502119301	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
344	190302659	Bela Fataya Azmi, S.Kom.I., M.A.	DOSEN	Dosen Tetap Khusus	0517039501	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
345	190302660	Raden Arditya Mutwara Lokita, M.I.Kom	DOSEN	Dosen Tetap Khusus	0511028904	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
346	190302661	Anggun Anindya Sekarningrum, M.I.Kom	DOSEN	Dosen Tetap Khusus	0529099001	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
347	190302663	Dinda Sukmaningrum, S.T., M.M	DOSEN	Dosen Tetap Fulltime	0512098301	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
348	190302664	Cicilia Dwi Setyorini, S.Pd., M.Hum	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
349	190302665	Riza Pahlevi, S.Tr.I.Kom., M.Sn	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
350	190302666	Rafi Kurnia Rachbini, S.Kom., M.Kom	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
351	190302667	Vicki Hanim Roiva, S.E., M.B.A	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
352	190302668	Ika Destina Puspita S.S., M.A.	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
353	190302669	April Purwanto, S.Ag., M.E.I	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
354	190302670	Rizki Mintari, M.Pd	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
355	190302671	Miko Kastomo Putro, M.Kom.	DOSEN	Dosen Tetap Khusus	0516039701	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
356	190302672	Marita Nurharjanti, S.Pd., M.Pd	DOSEN	Dosen Tetap Khusus	0518037201	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
357	190302673	Hermenegildus Agus Wibowo, S.S., M.Hum.	DOSEN	Dosen Tetap Khusus	0513048101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
358	190302674	Efrat Tegris, S.S., M.Pd	DOSEN	Dosen Tetap Khusus	0519097801	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
359	190302675	Kardilah Rohmat Hidayat, M.Kom	DOSEN	Dosen Tetap Fulltime	0501069101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
360	190302676	Fiyas Mahananing Puri, M.Kom	DOSEN	Dosen Tetap Fulltime	0512029203	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
361	190302677	Eva Budiana, S.Ak., M.Ak	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
362	190302678	Lutfi Windayani, S.E., M.Ak., Ak., CA., ACPA	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
363	190302679	Amirudin Khorul Huda, M.Kom	DOSEN	Dosen Tetap Khusus	0123099402	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
364	190302682	Abd. Mizwar A. Rahim, M.Kom	DOSEN	Dosen Tetap Khusus	0531109901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
365	190302683	Fauzia Anis Sekarningrum, S.T., M.T	DOSEN	Dosen Tetap Khusus	0530069601	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
366	190302684	Arif Nur Rohman, M.Kom	DOSEN	Dosen Tetap Fulltime	0525109202	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
367	190302685	Ichsan Wasiso, M.Kom	DOSEN	Dosen Tetap Khusus	0510088501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
368	190302686	Marwan Noor Fauzy, M.Kom	DOSEN	Dosen Tetap Khusus	0507099401	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
369	190302687	Caraka Aji Pranata, M.Kom	DOSEN	Dosen Tetap Khusus	0508129302	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
370	190302688	Eko Tri Anggono, S.E., M.M	DOSEN	Dosen Tetap Fulltime	0502077804	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
371	190302689	Yana Hendriana, S.T., M.Eng	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
372	190302690	Irma Suwarning D, S.Psi., M.Psi	DOSEN	Dosen Tetap Fulltime	0507118302	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
373	190302695	Tunggul Wicaksono, S.I.P., M.A	DOSEN	Dosen Tetap Khusus	0506129501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
374	190302696	Yohanes William Santoso, S.Hub.Int., M.Hub.Int.	DOSEN	Dosen Tetap Fulltime	0514099701	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
375	190302697	Feri Ludiyanto, S.Sn., M.Sn.	DOSEN	Dosen Tetap Khusus	0515018102	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
376	190302702	Yudha Riwanto, M.Kom	DOSEN	Dosen Tetap Khusus	0518039702	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
377	190302703	Hendri Kurniawan Prakosa, S.Kom., M.Cs	DOSEN	Dosen Tetap Khusus	0530079002	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
378	190302704	Deni Kurnianto Nugroho, S.Pd., M.Eng	DOSEN	Dosen Tetap Khusus	0505089401	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
379	190302705	Ajie Kusuma Wardhana, S.Kom., M.Eng	DOSEN	Dosen Freelance	0515129501	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
380	190302706	Enda Putri Atika, M.Kom	DOSEN	Dosen Tetap Khusus	0524089901	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
381	190302707	Bambang Pilu Hartato, S.Kom., M.Eng	DOSEN	Dosen Tetap Khusus	0609069202	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
382	190302708	Ahmad Ridwan, S.Tr.T., M.T	DOSEN	Dosen Tetap Khusus	9990631364	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
383	190302710	Fitriansyah, S.Si., M.Eng.	DOSEN	Dosen Tetap Fulltime	0509107504	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
384	190302711	Prasetyo Purnomo, S.Kom., M.Kom	DOSEN	Dosen Tetap Fulltime	0523108601	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
385	190302712	Dyah Ayu Kusumawardani, S. Pd., M. Pd.	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
386	190302713	Eny Ariyanto, S.E., M.Si., Dr.	DOSEN	Dosen Tetap Khusus	8992090024	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
387	190302714	David Agustriawan, S.Kom., M.Sc., Ph.D.	DOSEN	Dosen Freelance	0525088601	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
388	190302715	Arli Aditya Parikesit, S.Si., M.Si, Dr.rer.nat.	DOSEN	Dosen Freelance	2127067901	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
389	190302722	Rendy Mahardika, S.Kom., M.Kom	DOSEN	Dosen Tetap Khusus	0511069202	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
390	190302723	Hayati, SS., M.A	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
391	190302724	Alfian Muhazir, S.Sos., M.A	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
392	190302725	Dian Lestari, S.Pd., M.Pd	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
393	190302726	Achmad Djatmiko, M.A., Dr.	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
394	190302727	Cucut Susanto, S.Kom., M.Si., Dr.	DOSEN	Dosen Freelance	0927117301	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
395	190302729	Ibnul Muntaza, S.P.W.K., M.URP	DOSEN	Dosen Tetap Khusus	4145776677130133	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
396	190302730	Muhammad Najih Fasya, S.P.W.K., M.PAR.	DOSEN	Dosen Tetap Khusus	0506019801	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
397	190302731	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	DOSEN	Dosen Tetap Fulltime	0531079301	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
398	190302733	Kusumaningdiah Retno Setiorini, S.E., Ak., M.Ak., CA., Dr.	DOSEN	Dosen Freelance	0519058101	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
399	190302734	Lubna, M.Kom	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
400	190302735	Anip Moniva, M.Kom	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
401	190302736	Herin Dwibima Aprianto, M.Kom	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
402	190302737	Danu Prawira Utama, M.Kom	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
403	190302738	Ir. Erik Febriarta, S.Si., M.Sc.	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
404	190302741	Linda Hijriyah, S.T., M.Arch., Ph.D.	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
405	190302743	Dr. Mohamad Ilyas Abas, S.SI., M.Kom	DOSEN	Dosen Freelance	0926089101	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
406	190302744	Muhammad Alfian Hermawan, S.Pd., M.Pd.	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
407	190302745	Amanah, S.Pd., M.Pd	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
408	190302746	Fitria Wiyarti Nindyaningrum, M.Pd.	DOSEN	Dosen Freelance	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
409	190302747	Dr. Mawaidi, S.S., M.Pd.	DOSEN	Dosen Freelance	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
410	190302748	Qorib Munajat, S.Kom., M.Kom.	DOSEN	Dosen Tetap Khusus	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
411	555124	Eko Boedijanto, M.T.	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
412	555125	Baldric Siregar, Prof., Dr., MBA., CMA., CA.Ak.,	DOSEN	Dosen Freelance	0520096903	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
413	555169	Adi Djayusman, S.Kom., M.Kom	DOSEN	Dosen NIDN	0514058202	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
414	555195	Wing Wahyu Winarno, Dr., MAFIS., Ak.	DOSEN	-	0525016201	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
415	555200	Ayuni Fitria, S.Pd., M.A	DOSEN	Dosen Freelance	0520068503	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
416	555218	Sukoco, S.Si, M.Si, M.Kom	DOSEN	-	0611086801	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
417	555221	Evans Fuad, S.Kom, M.Eng	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
418	555227	Retantyo Wardoyo, Drs., M.Sc., Ph.D.	DOSEN	-	0011035906	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
419	555228	Dian Pertiwi, M.Kom	DOSEN	-	-	P	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
420	555253	Agung Wijanarko, S.Sos, MM	DOSEN	-	0513066803	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
421	88826	Bambang Suseno, Drs	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
422	88827	Sholeh, M.T	DOSEN	-	-	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
423	88896	Petra Surya Mega Wijaya, M.Si	DOSEN	Dosen Freelance	0501127202	L	2026-02-01 22:31:41.325236	2026-02-01 22:31:41.325236
\.


--
-- Data for Name: slot_examiners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.slot_examiners (id, slot_id, examiner_name, examiner_order, created_at) FROM stdin;
7855	2616	Wajar Bimantoro Suminto, Sn., M.Des	0	2026-02-12 14:23:25.177772
7856	2616	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	1	2026-02-12 14:23:25.177772
7857	2616	Riski Damastuti, S.Sos., M.A.	2	2026-02-12 14:23:25.177772
7858	2617	Andreas Tri Pamungkas, S.Sos., M.A.	0	2026-02-12 14:23:50.993478
7859	2617	Anggun Anindya Sekarningrum, M.I.Kom	1	2026-02-12 14:23:50.993478
7860	2617	Novita Ika Purnama Sari, S.I.Kom., M.A.	2	2026-02-12 14:23:50.993478
7861	2618	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	0	2026-02-12 14:23:59.451832
7862	2618	Devi Wening Astari, M.I.Kom	1	2026-02-12 14:23:59.451832
7863	2618	Novita Ika Purnama Sari, S.I.Kom., M.A.	2	2026-02-12 14:23:59.451832
7864	2619	Dr. Nurbayti, S.I.Kom., M.A.	0	2026-02-12 14:24:03.966676
7865	2619	Estiningsih, SE, MM	1	2026-02-12 14:24:03.966676
7866	2619	Novita Ika Purnama Sari, S.I.Kom., M.A.	2	2026-02-12 14:24:03.966676
7867	2620	Etik Anjar Fitriarti, S.I.Kom., M.A.	0	2026-02-12 14:24:05.72692
7868	2620	Kadek Kiki Astria, S.I.Kom., M.A.	1	2026-02-12 14:24:05.72692
7869	2620	Novita Ika Purnama Sari, S.I.Kom., M.A.	2	2026-02-12 14:24:05.72692
7870	2621	Mulyadi Erman, S.Ag, MA	0	2026-02-12 14:24:07.364739
7871	2621	Rivga Agusta, S.I.P., M.A.	1	2026-02-12 14:24:07.364739
7872	2621	Novita Ika Purnama Sari, S.I.Kom., M.A.	2	2026-02-12 14:24:07.364739
7873	2622	Rosyidah Jayanti Vijaya, S.E, M.Hum	0	2026-02-12 14:24:09.120991
7874	2622	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	1	2026-02-12 14:24:09.120991
7875	2622	Novita Ika Purnama Sari, S.I.Kom., M.A.	2	2026-02-12 14:24:09.120991
7876	2623	Rufki Ade Vinanda, S.I.Kom., M.A.	0	2026-02-12 14:24:10.741252
7877	2623	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	1	2026-02-12 14:24:10.741252
7878	2623	Novita Ika Purnama Sari, S.I.Kom., M.A.	2	2026-02-12 14:24:10.741252
7879	2624	Stara Asrita, S.I.Kom., M.A.	0	2026-02-12 14:24:12.249173
7880	2624	Zahrotus Sa'idah, S.I.Kom., M.A.	1	2026-02-12 14:24:12.249173
7881	2624	Novita Ika Purnama Sari, S.I.Kom., M.A.	2	2026-02-12 14:24:12.249173
7888	2627	Bela Fataya Azmi, S.Kom.I., M.A.	0	2026-02-12 14:24:23.19951
7889	2627	Nurfian Yudhistira, S.I.Kom., M.A.	1	2026-02-12 14:24:23.19951
7890	2627	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	2	2026-02-12 14:24:23.19951
7891	2628	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	0	2026-02-12 14:24:26.134445
7892	2628	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	1	2026-02-12 14:24:26.134445
7893	2628	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	2	2026-02-12 14:24:26.134445
7894	2629	Andreas Tri Pamungkas, S.Sos., M.A.	0	2026-02-12 14:24:27.960728
7895	2629	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	1	2026-02-12 14:24:27.960728
7896	2629	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	2	2026-02-12 14:24:27.960728
7903	2632	Marita Nurharjanti, S.Pd., M.Pd	0	2026-02-12 14:35:58.047488
7904	2632	Dr. Nurbayti, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
7905	2632	Rivga Agusta, S.I.P., M.A.	2	2026-02-12 14:35:58.047488
7906	2633	Achmad Fauzan., Dr., S.Psi., M.Psi., MM	0	2026-02-12 14:35:58.047488
7907	2633	Estiningsih, SE, MM	1	2026-02-12 14:35:58.047488
7908	2633	Rivga Agusta, S.I.P., M.A.	2	2026-02-12 14:35:58.047488
7909	2634	Zahrotus Sa'idah, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
7910	2634	Mulyadi Erman, S.Ag, MA	1	2026-02-12 14:35:58.047488
7911	2634	Etik Anjar Fitriarti, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
7912	2635	Zahrotus Sa'idah, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
7913	2635	Rosyidah Jayanti Vijaya, S.E, M.Hum	1	2026-02-12 14:35:58.047488
7914	2635	Etik Anjar Fitriarti, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
7915	2636	Estiningsih, SE, MM	0	2026-02-12 14:35:58.047488
7916	2636	Mulyadi Erman, S.Ag, MA	1	2026-02-12 14:35:58.047488
7917	2636	Nurfian Yudhistira, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
7918	2637	Junaidi, S.Ag., M.Hum, Dr.	0	2026-02-12 14:35:58.047488
7919	2637	Dr. Nurbayti, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
7920	2637	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	2	2026-02-12 14:35:58.047488
7921	2638	Rosyidah Jayanti Vijaya, S.E, M.Hum	0	2026-02-12 14:35:58.047488
7922	2638	Junaidi, S.Ag., M.Hum, Dr.	1	2026-02-12 14:35:58.047488
7923	2638	Wajar Bimantoro Suminto, Sn., M.Des	2	2026-02-12 14:35:58.047488
7930	2641	Estiningsih, SE, MM	0	2026-02-12 14:35:58.047488
7931	2641	Mulyadi Erman, S.Ag, MA	1	2026-02-12 14:35:58.047488
7932	2641	Nurfian Yudhistira, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
7939	2644	Dr. Nurbayti, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
7940	2644	Estiningsih, SE, MM	1	2026-02-12 14:35:58.047488
7941	2644	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
7942	2645	Mulyadi Erman, S.Ag, MA	0	2026-02-12 14:35:58.047488
7943	2645	Rosyidah Jayanti Vijaya, S.E, M.Hum	1	2026-02-12 14:35:58.047488
7944	2645	Stara Asrita, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
7948	2647	Junaidi, S.Ag., M.Hum, Dr.	0	2026-02-12 14:35:58.047488
7949	2647	Estiningsih, SE, MM	1	2026-02-12 14:35:58.047488
7950	2647	Rivga Agusta, S.I.P., M.A.	2	2026-02-12 14:35:58.047488
7951	2648	Rivga Agusta, S.I.P., M.A.	0	2026-02-12 14:35:58.047488
7952	2648	Junaidi, S.Ag., M.Hum, Dr.	1	2026-02-12 14:35:58.047488
7953	2648	Nurfian Yudhistira, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
7954	2649	Mulyadi Erman, S.Ag, MA	0	2026-02-12 14:35:58.047488
7955	2649	Rosyidah Jayanti Vijaya, S.E, M.Hum	1	2026-02-12 14:35:58.047488
7956	2649	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
7969	2654	Stara Asrita, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
7970	2654	Nurfian Yudhistira, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
7971	2654	Monika Pretty Aprilia, S.I.P., M.Si.	2	2026-02-12 14:35:58.047488
7972	2655	Stara Asrita, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
7973	2655	Rivga Agusta, S.I.P., M.A.	1	2026-02-12 14:35:58.047488
7974	2655	Bela Fataya Azmi, S.Kom.I., M.A.	2	2026-02-12 14:35:58.047488
7975	2656	Estiningsih, SE, MM	0	2026-02-12 14:35:58.047488
7976	2656	Mulyadi Erman, S.Ag, MA	1	2026-02-12 14:35:58.047488
7977	2656	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	2	2026-02-12 14:35:58.047488
7978	2657	Rosyidah Jayanti Vijaya, S.E, M.Hum	0	2026-02-12 14:35:58.047488
7979	2657	Stara Asrita, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
7980	2657	Devi Wening Astari, M.I.Kom	2	2026-02-12 14:35:58.047488
7981	2658	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	0	2026-02-12 14:35:58.047488
7982	2658	Dr. Nurbayti, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
7983	2658	Kadek Kiki Astria, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
7984	2659	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	0	2026-02-12 14:35:58.047488
7985	2659	Junaidi, S.Ag., M.Hum, Dr.	1	2026-02-12 14:35:58.047488
7986	2659	Kadek Kiki Astria, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
7987	2660	Kadek Kiki Astria, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
7988	2660	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	1	2026-02-12 14:35:58.047488
7989	2660	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-12 14:35:58.047488
7990	2661	Estiningsih, SE, MM	0	2026-02-12 14:35:58.047488
7991	2661	Mulyadi Erman, S.Ag, MA	1	2026-02-12 14:35:58.047488
7992	2661	Bela Fataya Azmi, S.Kom.I., M.A.	2	2026-02-12 14:35:58.047488
7993	2662	Rivga Agusta, S.I.P., M.A.	0	2026-02-12 14:35:58.047488
7994	2662	Rosyidah Jayanti Vijaya, S.E, M.Hum	1	2026-02-12 14:35:58.047488
7995	2662	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
7996	2663	Kadek Kiki Astria, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
7997	2663	Junaidi, S.Ag., M.Hum, Dr.	1	2026-02-12 14:35:58.047488
7998	2663	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8005	2666	Dr. Nurbayti, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8006	2666	Estiningsih, SE, MM	1	2026-02-12 14:35:58.047488
8007	2666	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8008	2667	Mulyadi Erman, S.Ag, MA	0	2026-02-12 14:35:58.047488
8009	2667	Rivga Agusta, S.I.P., M.A.	1	2026-02-12 14:35:58.047488
8010	2667	Devi Wening Astari, M.I.Kom	2	2026-02-12 14:35:58.047488
8011	2668	Kadek Kiki Astria, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8012	2668	Rosyidah Jayanti Vijaya, S.E, M.Hum	1	2026-02-12 14:35:58.047488
8013	2668	Devi Wening Astari, M.I.Kom	2	2026-02-12 14:35:58.047488
8014	2669	Kadek Kiki Astria, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8015	2669	Stara Asrita, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8016	2669	Riski Damastuti, S.Sos., M.A.	2	2026-02-12 14:35:58.047488
8017	2670	Kadek Kiki Astria, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8018	2670	Junaidi, S.Ag., M.Hum, Dr.	1	2026-02-12 14:35:58.047488
8019	2670	Etik Anjar Fitriarti, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
8023	2672	Nurfian Yudhistira, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8024	2672	Dr. Nurbayti, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8025	2672	Rufki Ade Vinanda, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
8026	2673	Rosyidah Jayanti Vijaya, S.E, M.Hum	0	2026-02-12 14:35:58.047488
8027	2673	Stara Asrita, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8028	2673	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-12 14:35:58.047488
8029	2674	Estiningsih, SE, MM	0	2026-02-12 14:35:58.047488
8030	2674	Mulyadi Erman, S.Ag, MA	1	2026-02-12 14:35:58.047488
8031	2674	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-12 14:35:58.047488
8032	2675	Rivga Agusta, S.I.P., M.A.	0	2026-02-12 14:35:58.047488
8033	2675	Junaidi, S.Ag., M.Hum, Dr.	1	2026-02-12 14:35:58.047488
8034	2675	Andreas Tri Pamungkas, S.Sos., M.A.	2	2026-02-12 14:35:58.047488
8038	2677	Kadek Kiki Astria, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8039	2677	Nurfian Yudhistira, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8040	2677	Rufki Ade Vinanda, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
8041	2678	Dr. Nurbayti, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8042	2678	Estiningsih, SE, MM	1	2026-02-12 14:35:58.047488
8043	2678	Andreas Tri Pamungkas, S.Sos., M.A.	2	2026-02-12 14:35:58.047488
8044	2679	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	0	2026-02-12 14:35:58.047488
8045	2679	Kadek Kiki Astria, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8046	2679	Riski Damastuti, S.Sos., M.A.	2	2026-02-12 14:35:58.047488
8050	2681	Mulyadi Erman, S.Ag, MA	0	2026-02-12 14:35:58.047488
8051	2681	Rivga Agusta, S.I.P., M.A.	1	2026-02-12 14:35:58.047488
8052	2681	Etik Anjar Fitriarti, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
8053	2682	Rosyidah Jayanti Vijaya, S.E, M.Hum	0	2026-02-12 14:35:58.047488
8054	2682	Nurfian Yudhistira, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8055	2682	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8056	2683	Dr. Nurbayti, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8057	2683	Estiningsih, SE, MM	1	2026-02-12 14:35:58.047488
8058	2683	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-12 14:35:58.047488
8065	2686	Kadek Kiki Astria, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8066	2686	Rosyidah Jayanti Vijaya, S.E, M.Hum	1	2026-02-12 14:35:58.047488
8067	2686	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-12 14:35:58.047488
8068	2687	Rivga Agusta, S.I.P., M.A.	0	2026-02-12 14:35:58.047488
8069	2687	Stara Asrita, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8070	2687	Bela Fataya Azmi, S.Kom.I., M.A.	2	2026-02-12 14:35:58.047488
8074	2689	Zahrotus Sa'idah, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8075	2689	Kadek Kiki Astria, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8076	2689	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-12 14:35:58.047488
8077	2690	Zahrotus Sa'idah, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8078	2690	Kadek Kiki Astria, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8079	2690	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	2	2026-02-12 14:35:58.047488
8083	2692	Zahrotus Sa'idah, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8084	2692	Estiningsih, SE, MM	1	2026-02-12 14:35:58.047488
8085	2692	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-12 14:35:58.047488
8086	2693	Mulyadi Erman, S.Ag, MA	0	2026-02-12 14:35:58.047488
8087	2693	Rivga Agusta, S.I.P., M.A.	1	2026-02-12 14:35:58.047488
8088	2693	Devi Wening Astari, M.I.Kom	2	2026-02-12 14:35:58.047488
8092	2695	Zahrotus Sa'idah, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8093	2695	Dr. Nurbayti, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8094	2695	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8095	2696	Estiningsih, SE, MM	0	2026-02-12 14:35:58.047488
8096	2696	Rivga Agusta, S.I.P., M.A.	1	2026-02-12 14:35:58.047488
8097	2696	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	2	2026-02-12 14:35:58.047488
8098	2697	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	0	2026-02-12 14:35:58.047488
8099	2697	Zahrotus Sa'idah, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8100	2697	Rufki Ade Vinanda, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
8101	2698	Nurfian Yudhistira, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8102	2698	Mulyadi Erman, S.Ag, MA	1	2026-02-12 14:35:58.047488
8103	2698	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8104	2699	Junaidi, S.Ag., M.Hum, Dr.	0	2026-02-12 14:35:58.047488
8105	2699	Rosyidah Jayanti Vijaya, S.E, M.Hum	1	2026-02-12 14:35:58.047488
8106	2699	Devi Wening Astari, M.I.Kom	2	2026-02-12 14:35:58.047488
8110	2701	Zahrotus Sa'idah, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8111	2701	Dr. Nurbayti, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8112	2701	Etik Anjar Fitriarti, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
8113	2702	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	0	2026-02-12 14:35:58.047488
8114	2702	Zahrotus Sa'idah, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8115	2702	Anggun Anindya Sekarningrum, M.I.Kom	2	2026-02-12 14:35:58.047488
8119	2704	Zahrotus Sa'idah, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8120	2704	Dr. Nurbayti, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8121	2704	Anggun Anindya Sekarningrum, M.I.Kom	2	2026-02-12 14:35:58.047488
8122	2705	Junaidi, S.Ag., M.Hum, Dr.	0	2026-02-12 14:35:58.047488
8123	2705	Estiningsih, SE, MM	1	2026-02-12 14:35:58.047488
8124	2705	Anggun Anindya Sekarningrum, M.I.Kom	2	2026-02-12 14:35:58.047488
8125	2706	Mulyadi Erman, S.Ag, MA	0	2026-02-12 14:35:58.047488
8126	2706	Rivga Agusta, S.I.P., M.A.	1	2026-02-12 14:35:58.047488
8127	2706	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8134	2709	Etik Anjar Fitriarti, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8135	2709	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	1	2026-02-12 14:35:58.047488
8136	2709	Anggun Anindya Sekarningrum, M.I.Kom	2	2026-02-12 14:35:58.047488
8137	2710	Dr. Nurbayti, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8138	2710	Estiningsih, SE, MM	1	2026-02-12 14:35:58.047488
8139	2710	Rufki Ade Vinanda, S.I.Kom., M.A.	2	2026-02-12 14:35:58.047488
8140	2711	Zahrotus Sa'idah, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8141	2711	Kadek Kiki Astria, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8142	2711	Bela Fataya Azmi, S.Kom.I., M.A.	2	2026-02-12 14:35:58.047488
8143	2712	Rufki Ade Vinanda, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8144	2712	Etik Anjar Fitriarti, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8145	2712	Anggun Anindya Sekarningrum, M.I.Kom	2	2026-02-12 14:35:58.047488
8146	2713	Nurfian Yudhistira, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8147	2713	Mulyadi Erman, S.Ag, MA	1	2026-02-12 14:35:58.047488
8148	2713	Devi Wening Astari, M.I.Kom	2	2026-02-12 14:35:58.047488
8149	2714	Devi Wening Astari, M.I.Kom	0	2026-02-12 14:35:58.047488
8150	2714	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	1	2026-02-12 14:35:58.047488
8151	2714	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	2	2026-02-12 14:35:58.047488
8152	2715	Kadek Kiki Astria, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8153	2715	Rivga Agusta, S.I.P., M.A.	1	2026-02-12 14:35:58.047488
8154	2715	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8155	2716	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	0	2026-02-12 14:35:58.047488
8156	2716	Rufki Ade Vinanda, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8157	2716	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8158	2717	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	0	2026-02-12 14:35:58.047488
8159	2717	Rufki Ade Vinanda, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8160	2717	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8161	2718	Devi Wening Astari, M.I.Kom	0	2026-02-12 14:35:58.047488
8162	2718	Zahrotus Sa'idah, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8163	2718	Bela Fataya Azmi, S.Kom.I., M.A.	2	2026-02-12 14:35:58.047488
8164	2719	Bela Fataya Azmi, S.Kom.I., M.A.	0	2026-02-12 14:35:58.047488
8165	2719	Devi Wening Astari, M.I.Kom	1	2026-02-12 14:35:58.047488
8166	2719	Wajar Bimantoro Suminto, Sn., M.Des	2	2026-02-12 14:35:58.047488
8167	2720	Rosyidah Jayanti Vijaya, S.E, M.Hum	0	2026-02-12 14:35:58.047488
8168	2720	Stara Asrita, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8169	2720	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-12 14:35:58.047488
8173	2722	Etik Anjar Fitriarti, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8174	2722	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	1	2026-02-12 14:35:58.047488
8175	2722	Andreas Tri Pamungkas, S.Sos., M.A.	2	2026-02-12 14:35:58.047488
8176	2723	Wajar Bimantoro Suminto, Sn., M.Des	0	2026-02-12 14:35:58.047488
8177	2723	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	1	2026-02-12 14:35:58.047488
8178	2723	Andreas Tri Pamungkas, S.Sos., M.A.	2	2026-02-12 14:35:58.047488
8179	2724	Wajar Bimantoro Suminto, Sn., M.Des	0	2026-02-12 14:35:58.047488
8180	2724	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	1	2026-02-12 14:35:58.047488
8181	2724	Andreas Tri Pamungkas, S.Sos., M.A.	2	2026-02-12 14:35:58.047488
8182	2725	Wajar Bimantoro Suminto, Sn., M.Des	0	2026-02-12 14:35:58.047488
8183	2725	Rufki Ade Vinanda, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8184	2725	Andreas Tri Pamungkas, S.Sos., M.A.	2	2026-02-12 14:35:58.047488
8185	2726	Wajar Bimantoro Suminto, Sn., M.Des	0	2026-02-12 14:35:58.047488
8186	2726	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	1	2026-02-12 14:35:58.047488
8187	2726	Andreas Tri Pamungkas, S.Sos., M.A.	2	2026-02-12 14:35:58.047488
8188	2727	Junaidi, S.Ag., M.Hum, Dr.	0	2026-02-12 14:35:58.047488
8189	2727	Zahrotus Sa'idah, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8190	2727	Riski Damastuti, S.Sos., M.A.	2	2026-02-12 14:35:58.047488
8191	2728	Nurfian Yudhistira, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8192	2728	Dr. Nurbayti, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8193	2728	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8194	2729	Rufki Ade Vinanda, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8195	2729	Bela Fataya Azmi, S.Kom.I., M.A.	1	2026-02-12 14:35:58.047488
8196	2729	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8197	2730	Devi Wening Astari, M.I.Kom	0	2026-02-12 14:35:58.047488
8198	2730	Etik Anjar Fitriarti, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8199	2730	Riski Damastuti, S.Sos., M.A.	2	2026-02-12 14:35:58.047488
8200	2731	Rufki Ade Vinanda, S.I.Kom., M.A.	0	2026-02-12 14:35:58.047488
8201	2731	Bela Fataya Azmi, S.Kom.I., M.A.	1	2026-02-12 14:35:58.047488
8202	2731	Riski Damastuti, S.Sos., M.A.	2	2026-02-12 14:35:58.047488
8203	2732	Devi Wening Astari, M.I.Kom	0	2026-02-12 14:35:58.047488
8204	2732	Etik Anjar Fitriarti, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8205	2732	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8206	2733	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	0	2026-02-12 14:35:58.047488
8207	2733	Zahrotus Sa'idah, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8208	2733	Anggun Anindya Sekarningrum, M.I.Kom	2	2026-02-12 14:35:58.047488
8209	2734	Estiningsih, SE, MM	0	2026-02-12 14:35:58.047488
8210	2734	Kadek Kiki Astria, S.I.Kom., M.A.	1	2026-02-12 14:35:58.047488
8211	2734	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8212	2735	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	0	2026-02-12 14:35:58.047488
8213	2735	Anggun Anindya Sekarningrum, M.I.Kom	1	2026-02-12 14:35:58.047488
8214	2735	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-12 14:35:58.047488
8215	2736	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	0	2026-02-12 14:35:58.047488
8216	2736	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	1	2026-02-12 14:35:58.047488
8217	2736	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-12 14:35:58.047488
8218	2737	Anggun Anindya Sekarningrum, M.I.Kom	0	2026-02-12 14:35:58.047488
8219	2737	Bela Fataya Azmi, S.Kom.I., M.A.	1	2026-02-12 14:35:58.047488
8220	2737	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8221	2738	Angga Intueri Mahendra Purbakusuma, S.Sos., M.I.Kom.	0	2026-02-12 14:35:58.047488
8222	2738	Mulyadi Erman, S.Ag, MA	1	2026-02-12 14:35:58.047488
8223	2738	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	2	2026-02-12 14:35:58.047488
8224	2739	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	0	2026-02-12 14:46:51.355576
8225	2739	Devi Wening Astari, M.I.Kom	1	2026-02-12 14:46:51.355576
8226	2739	Dr. Nurbayti, S.I.Kom., M.A.	2	2026-02-12 14:46:51.355576
8227	2740	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	0	2026-02-12 14:46:51.355576
8228	2740	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	1	2026-02-12 14:46:51.355576
8229	2740	Anggun Anindya Sekarningrum, M.I.Kom	2	2026-02-12 14:46:51.355576
8230	2741	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	0	2026-02-12 14:46:51.355576
8231	2741	Wajar Bimantoro Suminto, Sn., M.Des	1	2026-02-12 14:46:51.355576
8232	2741	Riski Damastuti, S.Sos., M.A.	2	2026-02-12 14:46:51.355576
8233	2742	Wajar Bimantoro Suminto, Sn., M.Des	0	2026-02-12 14:46:51.355576
8234	2742	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	1	2026-02-12 14:46:51.355576
8235	2742	Andreas Tri Pamungkas, S.Sos., M.A.	2	2026-02-12 14:46:51.355576
8236	2743	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	0	2026-02-12 15:32:15.680946
8237	2743	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	1	2026-02-12 15:32:15.680946
8238	2743	Wajar Bimantoro Suminto, Sn., M.Des	2	2026-02-12 15:32:15.680946
8239	2744	Fitria Nuraini Sekarsih, M.Sc.	0	2026-02-12 15:49:36.45876
8240	2744	Vidyana Arsanti, M.Sc.	1	2026-02-12 15:49:36.45876
8241	2744	Widiyana Riasasi, S.Si., M.Sc.	2	2026-02-12 15:49:36.45876
8242	2745	Dr. Ika Afianita S., M. Sc.	0	2026-02-12 15:49:36.45876
8243	2745	Sadewa Purba Sejati, M. Sc.	1	2026-02-12 15:49:36.45876
8244	2745	Widiyana Riasasi, S.Si., M.Sc.	2	2026-02-12 15:49:36.45876
8245	2746	Sadewa Purba Sejati, M. Sc.	0	2026-02-12 15:49:36.45876
8246	2746	Dr. Ika Afianita S., M. Sc.	1	2026-02-12 15:49:36.45876
8247	2746	Fitria Nuraini Sekarsih, S.Si, M.Sc	2	2026-02-12 15:49:36.45876
8248	2747	Widiyana Riasasi, S.Si., M.Sc.	0	2026-02-12 15:49:36.45876
8249	2747	Vidyana Arsanti, M.Sc.	1	2026-02-12 15:49:36.45876
8250	2747	Sadewa Purba Sejati, S.Si., M.Sc.	2	2026-02-12 15:49:36.45876
8251	2748	Ni'mah Mahnunah, S.T., M.T.	0	2026-02-12 15:55:29.699797
8252	2748	Renindya Azizza Kartikakirana, S.T., M.Eng.	1	2026-02-12 15:55:29.699797
8253	2748	Bagus Ramadhan, S.T., M.Eng.	2	2026-02-12 15:55:29.699797
8254	2749	Rivi Neritarani, S.Si., M.Eng.	0	2026-02-12 15:55:29.699797
8255	2749	Gardyas Bidari Adninda, S.T., M.A.	1	2026-02-12 15:55:29.699797
8256	2749	Renindya Azizza Kartikakirana, S.T., M.Eng.	2	2026-02-12 15:55:29.699797
8257	2750	Ni'mah Mahnunah, S.T., M.T.	0	2026-02-12 15:55:29.699797
8258	2750	Bagus Ramadhan, S.T., M.Eng.	1	2026-02-12 15:55:29.699797
8259	2750	Gardyas Bidari Adninda, S.T., M.A.	2	2026-02-12 15:55:29.699797
8260	2751	Gardyas Bidari Adninda, S.T., M.A.	0	2026-02-12 15:55:29.699797
8261	2751	Ni'mah Mahnunah, S.T., M.T.	1	2026-02-12 15:55:29.699797
8262	2751	Rivi Neritarani, S.Si., M.Eng.	2	2026-02-12 15:55:29.699797
8263	2752	Bagus Ramadhan, S.T., M.Eng.	0	2026-02-12 15:55:29.699797
8264	2752	Renindya Azizza Kartikakirana, S.T., M.Eng.	1	2026-02-12 15:55:29.699797
8265	2752	Ni'mah Mahnunah, S.T., M.T.	2	2026-02-12 15:55:29.699797
8266	2753	Renindya Azizza Kartikakirana, S.T., M.Eng.	0	2026-02-12 15:55:29.699797
8267	2753	Bagus Ramadhan, S.T., M.Eng.	1	2026-02-12 15:55:29.699797
8268	2753	Gardyas Bidari Adninda, S.T., M.A.	2	2026-02-12 15:55:29.699797
8269	2754	Laksmindra Saptyawati, S.E., M.B.A.	0	2026-02-13 01:22:16.749097
8270	2754	Mei Maemunah, S.H., M.M.	1	2026-02-13 01:22:16.749097
8271	2754	Suyatmi, S.E., M.M.	2	2026-02-13 01:22:16.749097
8272	2755	Suyatmi, S.E., M.M.	0	2026-02-13 01:22:16.749097
8273	2755	Laksmindra Saptyawati, S.E., M.B.A.	1	2026-02-13 01:22:16.749097
8274	2755	Dinda Sukmaningrum, S.T., M.M	2	2026-02-13 01:22:16.749097
8275	2756	Suyatmi, S.E., M.M.	0	2026-02-13 01:22:16.749097
8276	2756	Rahma Widyawati, S.E., M.M.	1	2026-02-13 01:22:16.749097
8277	2756	Dodi Setiawan R, S.Psi, MBA, Dr.	2	2026-02-13 01:22:16.749097
8278	2757	Dr. Reza Widhar Pahlevi, S.E., M.M.	0	2026-02-13 01:22:16.749097
8279	2757	Dinda Sukmaningrum, S.T., M.M	1	2026-02-13 01:22:16.749097
8280	2757	Eny Ariyanto, S.E., M.Si., Dr.	2	2026-02-13 01:22:16.749097
8281	2758	Dr. Reza Widhar Pahlevi, S.E., M.M.	0	2026-02-13 01:22:16.749097
8282	2758	Yusuf Amri Amrullah, S.E., M.M.	1	2026-02-13 01:22:16.749097
8283	2758	Eny Ariyanto, S.E., M.Si., Dr.	2	2026-02-13 01:22:16.749097
8284	2759	Suyatmi, S.E., M.M.	0	2026-02-13 01:22:16.749097
8285	2759	Narwanto Nurcahyo, SH, MM	1	2026-02-13 01:22:16.749097
8286	2759	Dinda Sukmaningrum, S.T., M.M	2	2026-02-13 01:22:16.749097
8290	2761	Dinda Sukmaningrum, S.T., M.M	0	2026-02-13 01:22:16.749097
8291	2761	Dr. Reza Widhar Pahlevi, S.E., M.M.	1	2026-02-13 01:22:16.749097
8292	2761	Eny Ariyanto, S.E., M.Si., Dr.	2	2026-02-13 01:22:16.749097
8293	2762	Rahma Widyawati, S.E., M.M.	0	2026-02-13 01:22:16.749097
8294	2762	Suyatmi, S.E., M.M.	1	2026-02-13 01:22:16.749097
8295	2762	Yusuf Amri Amrullah, S.E., M.M.	2	2026-02-13 01:22:16.749097
8296	2763	Nurhayanto, S.E., M.B.A.	0	2026-02-13 01:22:16.749097
8297	2763	Rahma Widyawati, S.E., M.M.	1	2026-02-13 01:22:16.749097
8298	2763	Suyatmi, S.E., M.M.	2	2026-02-13 01:22:16.749097
8299	2764	Suyatmi, S.E., M.M.	0	2026-02-13 01:22:16.749097
8300	2764	Mei Maemunah, S.H., M.M.	1	2026-02-13 01:22:16.749097
8301	2764	Rahma Widyawati, S.E., M.M.	2	2026-02-13 01:22:16.749097
8302	2765	Dr. Reza Widhar Pahlevi, S.E., M.M.	0	2026-02-13 01:22:16.749097
8303	2765	Nurhayanto, S.H., M.B.A.	1	2026-02-13 01:22:16.749097
8304	2765	Laksmindra Saptyawati, S.E., M.B.A.	2	2026-02-13 01:22:16.749097
8308	2767	Yusuf Amri Amri Amrullah, S.E., M.M.	0	2026-02-13 01:22:16.749097
8309	2767	Laksmindra Saptyawati, S.E., M.B.A.	1	2026-02-13 01:22:16.749097
8310	2767	Rahma Widyawati, S.E., M.M.	2	2026-02-13 01:22:16.749097
8311	2768	Dinda Sukmaningrum, S.T., M.M	0	2026-02-13 01:22:16.749097
8312	2768	Yusuf Amri Amrullah, S.E., M.M.	1	2026-02-13 01:22:16.749097
8313	2768	Dr. Reza Widhar Pahlevi, S.E., M.M.	2	2026-02-13 01:22:16.749097
8317	2770	Dr. Reza Widhar Pahlevi, S.E., M.M.	0	2026-02-13 01:22:16.749097
8318	2770	Nurhayanto, S.E., M.B.A.	1	2026-02-13 01:22:16.749097
8319	2770	Dinda Sukmaningrum, S.T., M.M	2	2026-02-13 01:22:16.749097
8320	2771	Narwanto Nurcahyo, S.H., M.M.	0	2026-02-13 01:22:16.749097
8321	2771	Dinda Sukmaningrum, S.T., M.M	1	2026-02-13 01:22:16.749097
8322	2771	Suyatmi, S.E., M.M.	2	2026-02-13 01:22:16.749097
8323	2772	Narwanto Nurcahyo, S.H., M.M.	0	2026-02-13 01:22:16.749097
8324	2772	Nurhayanto, S.E., M.B.A.	1	2026-02-13 01:22:16.749097
8325	2772	Yusuf Amri Amrullah, S.E., M.M.	2	2026-02-13 01:22:16.749097
8338	2777	Laksmindra Saptyawati, S.E., M.B.A.	0	2026-02-13 01:22:16.749097
8339	2777	Nurhayanto, S.E., M.B.A.	1	2026-02-13 01:22:16.749097
8340	2777	Suyatmi, S.E., M.M.	2	2026-02-13 01:22:16.749097
8341	2778	Laksmindra Saptyawati, S.E., M.B.A.	0	2026-02-13 01:22:16.749097
8342	2778	Nurhayanto, S.E., M.M.	1	2026-02-13 01:22:16.749097
8343	2778	Rahma Widyawati, S.E., M.M.	2	2026-02-13 01:22:16.749097
8344	2779	Narwanto Nurcahyo, S.H, M.M.	0	2026-02-13 01:22:16.749097
8345	2779	Laksmindra Saptyawati, S.E., M.B.A.	1	2026-02-13 01:22:16.749097
8346	2779	Rahma Widyawati, S.E., M.M.	2	2026-02-13 01:22:16.749097
8347	2780	Fahrul Imam Santoso, S.E., M.Akt.	0	2026-02-13 01:28:19.974733
8348	2780	Irton, S.E, M.Si	1	2026-02-13 01:28:19.974733
8349	2780	Widiyanti Kurnianingsih, S.E., M.Ak.	2	2026-02-13 01:28:19.974733
8350	2781	Fahrul Imam Santoso, S.E., M.Akt.	0	2026-02-13 01:28:19.974733
8351	2781	Irton, S.E, M.Si	1	2026-02-13 01:28:19.974733
8352	2781	Sutarni, S.E., M.M.	2	2026-02-13 01:28:19.974733
8353	2782	Edy Anan, S.E., M.Ak., Ak., CA	0	2026-02-13 01:28:19.974733
8354	2782	Sutarni, S.E., M.M.	1	2026-02-13 01:28:19.974733
8355	2782	Yola Andesta Valenty, S.E., M.Ak.	2	2026-02-13 01:28:19.974733
8356	2783	Edy Anan, S.E., M.Ak., Ak., CA	0	2026-02-13 01:28:19.974733
8357	2783	Yola Andesta Valenty, S.E., M.Ak.	1	2026-02-13 01:28:19.974733
8358	2783	Sutarni, S.E., M.M.	2	2026-02-13 01:28:19.974733
8359	2784	Fahrul Imam Santoso, S.E., M.Akt.	0	2026-02-13 01:28:19.974733
8360	2784	Yola Andesta Valenty, S.E., M.Ak.	1	2026-02-13 01:28:19.974733
8361	2784	Edy Anan, S.E., M.Ak., Ak., CA	2	2026-02-13 01:28:19.974733
8362	2785	Aditya Maulana Hasymi, S.IP., M.A.	0	2026-02-13 01:32:38.228292
8363	2785	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	1	2026-02-13 01:32:38.228292
8364	2785	Seftina Kuswardini, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8365	2786	Aditya Maulana Hasymi, S.IP., M.A.	0	2026-02-13 01:32:38.228292
8366	2786	Yohanes William Santoso, M.Hub.Int.	1	2026-02-13 01:32:38.228292
8367	2786	Seftina Kuswardini, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8368	2787	Aditya Maulana Hasymi, S.IP., M.A.	0	2026-02-13 01:32:38.228292
8369	2787	Yohanes William Santoso, M.Hub.Int.	1	2026-02-13 01:32:38.228292
8370	2787	Seftina Kuswardini, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8371	2788	Seftina Kuswardini, S.IP., M.A.	0	2026-02-13 01:32:38.228292
8372	2788	Yohanes William Santoso, M.Hub.Int.	1	2026-02-13 01:32:38.228292
8373	2788	Yoga Suharman, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8374	2789	Seftina Kuswardini, S.IP., M.A.	0	2026-02-13 01:32:38.228292
8375	2789	Laksmindra Saptyawati, S.E., M.B.A.	1	2026-02-13 01:32:38.228292
8376	2789	Aditya Maulana Hasymi, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8377	2790	Yohanes William Santoso, M.Hub.Int.	0	2026-02-13 01:32:38.228292
8378	2790	Seftina Kuswardini, S.IP., M.A.	1	2026-02-13 01:32:38.228292
8379	2790	Aditya Maulana Hasymi, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8380	2791	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	0	2026-02-13 01:32:38.228292
8381	2791	Yohanes William Santoso, M.Hub.Int.	1	2026-02-13 01:32:38.228292
8382	2791	Yoga Suharman, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8383	2792	Seftina Kuswardini, S.IP., M.A.	0	2026-02-13 01:32:38.228292
8384	2792	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	1	2026-02-13 01:32:38.228292
8385	2792	Aditya Maulana Hasymi, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8386	2793	Aditya Maulana Hasymi, S.IP., M.A.	0	2026-02-13 01:32:38.228292
8387	2793	Yohanes William Santoso, M.Hub.Int.	1	2026-02-13 01:32:38.228292
8388	2793	Seftina Kuswardini, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8389	2794	Aditya Maulana Hasymi, S.IP., M.A.	0	2026-02-13 01:32:38.228292
8390	2794	Yohanes William Santoso, M.Hub.Int.	1	2026-02-13 01:32:38.228292
8391	2794	Yoga Suharman, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8392	2795	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	0	2026-02-13 01:32:38.228292
8393	2795	Yohanes William Santoso, M.Hub.Int.	1	2026-02-13 01:32:38.228292
8394	2795	Aditya Maulana Hasymi, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8395	2796	Yohanes William Santoso, M.Hub.Int.	0	2026-02-13 01:32:38.228292
8396	2796	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	1	2026-02-13 01:32:38.228292
8397	2796	Yoga Suharman, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8398	2797	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	0	2026-02-13 01:32:38.228292
8399	2797	Yohanes William Santoso, M.Hub.Int.	1	2026-02-13 01:32:38.228292
8400	2797	Yoga Suharman, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8401	2798	Yohanes William Santoso, M.Hub.Int.	0	2026-02-13 01:32:38.228292
8402	2798	Aditya Maulana Hasymi, S.IP., M.A.	1	2026-02-13 01:32:38.228292
8403	2798	Seftina Kuswardini, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8404	2799	Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D.	0	2026-02-13 01:32:38.228292
8405	2799	Seftina Kuswardini, S.IP., M.A.	1	2026-02-13 01:32:38.228292
8406	2799	Yoga Suharman, S.IP., M.A.	2	2026-02-13 01:32:38.228292
8407	2800	Dr. Ismadiyanti Purwaning Astuti, S.E., M.Sc.	0	2026-02-13 01:42:10.634475
8408	2800	Atika Fatimah, S.E., M.Ec.Dev.	1	2026-02-13 01:42:10.634475
8409	2800	Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev.	2	2026-02-13 01:42:10.634475
8410	2801	Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev.	0	2026-02-13 01:42:10.634475
8411	2801	Istiningsih, S.E., M.M.	1	2026-02-13 01:42:10.634475
8412	2801	Anik Sri Widawati, S.Sos., M.M.	2	2026-02-13 01:42:10.634475
8413	2802	Mei Maemunah, S.H., M.M.	0	2026-02-13 01:42:10.634475
8414	2802	Agustina Rahmawati, S.A.P., M.Si.	1	2026-02-13 01:42:10.634475
8415	2802	Ardiyati, S.I.P., M.P.A	2	2026-02-13 01:42:10.634475
8416	2803	Dra. Sri Mulyatun., M.M	0	2026-02-13 01:42:10.634475
8417	2803	Istiningsih, S.E., M.M.	1	2026-02-13 01:42:10.634475
8418	2803	Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev.	2	2026-02-13 01:42:10.634475
8419	2804	Anggrismono, S.E., M.Ec.Dev.	0	2026-02-13 01:42:10.634475
8420	2804	Istiningsih, S.E., M.M.	1	2026-02-13 01:42:10.634475
8421	2804	Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev.	2	2026-02-13 01:42:10.634475
8422	2805	Dr. Ismadiyanti Purwaning Astuti, S.E., M.Sc.	0	2026-02-13 01:42:10.634475
8423	2805	Anggrismono, S.E., M.Ec.Dev.	1	2026-02-13 01:42:10.634475
8424	2805	Anik Sri Widawati, S.Sos., M.M.	2	2026-02-13 01:42:10.634475
8425	2806	Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev.	0	2026-02-13 01:42:10.634475
8426	2806	Anik Sri Widawati, S.Sos., M.M.	1	2026-02-13 01:42:10.634475
8427	2806	Atika Fatimah, S.E., M.Ec.Dev.	2	2026-02-13 01:42:10.634475
8428	2807	Anggrismono, S.E., M.Ec.Dev.	0	2026-02-13 01:42:10.634475
8429	2807	Dra. Sri Mulyatun., M.M	1	2026-02-13 01:42:10.634475
8430	2807	Atika Fatimah, S.E., M.Ec.Dev.	2	2026-02-13 01:42:10.634475
8431	2808	Anik Sri Widawati, S.Sos., M.M.	0	2026-02-13 01:42:10.634475
8432	2808	Atika Fatimah, S.E., M.Ec.Dev.	1	2026-02-13 01:42:10.634475
8433	2808	Dr. Ismadiyanti Purwaning Astuti, S.E., M.Sc.	2	2026-02-13 01:42:10.634475
8434	2809	Ardiyati, S.I.P., M.P.A	0	2026-02-13 01:42:10.634475
8435	2809	Agustina Rahmawati, S.A.P., M.Si.	1	2026-02-13 01:42:10.634475
8436	2809	Ferri Wicaksono, S.I.P., M.A.	2	2026-02-13 01:42:10.634475
8437	2810	Ferri Wicaksono, S.I.P., M.A.	0	2026-02-13 01:42:10.634475
8438	2810	Hanantyo Sri Nugroho, S.IP., M.A.	1	2026-02-13 01:42:10.634475
8439	2810	Muhammad Zuhdan, S.I.P., M.A.	2	2026-02-13 01:42:10.634475
8440	2811	Ferri Wicaksono, S.I.P., M.A.	0	2026-02-13 01:42:10.634475
8441	2811	Muhammad Zuhdan, S.I.P., M.A.	1	2026-02-13 01:42:10.634475
8442	2811	Hanantyo Sri Nugroho, S.IP., M.A.	2	2026-02-13 01:42:10.634475
8443	2812	Ferri Wicaksono, S.I.P., M.A.	0	2026-02-13 01:42:10.634475
8444	2812	Muhammad Zuhdan, S.I.P., M.A.	1	2026-02-13 01:42:10.634475
8445	2812	Hanantyo Sri Nugroho, S.IP., M.A.	2	2026-02-13 01:42:10.634475
8446	2813	Hanantyo Sri Nugroho, S.IP., M.A.	0	2026-02-13 01:42:10.634475
8447	2813	Ferri Wicaksono, S.I.P., M.A.	1	2026-02-13 01:42:10.634475
8448	2813	Muhammad Zuhdan, S.I.P., M.A.	2	2026-02-13 01:42:10.634475
8449	2814	Muhammad Zuhdan, S.I.P., M.A.	0	2026-02-13 01:42:10.634475
8450	2814	Hanantyo Sri Nugroho, S.IP., M.A.	1	2026-02-13 01:42:10.634475
8451	2814	Ferri Wicaksono, S.I.P., M.A.	2	2026-02-13 01:42:10.634475
8452	2815	Muhammad Zuhdan, S.I.P., M.A.	0	2026-02-13 01:42:10.634475
8453	2815	Hanantyo Sri Nugroho, S.IP., M.A.	1	2026-02-13 01:42:10.634475
8454	2815	Ferri Wicaksono, S.I.P., M.A.	2	2026-02-13 01:42:10.634475
8455	2816	Mei Maemunah, S.H., M.M.	0	2026-02-13 01:42:10.634475
8456	2816	Agustina Rahmawati, S.A.P., M.Si.	1	2026-02-13 01:42:10.634475
8457	2816	Ardiyati, S.I.P., M.P.A	2	2026-02-13 01:42:10.634475
8458	2817	Ardiyati, S.I.P., M.P.A	0	2026-02-13 01:42:10.634475
8459	2817	Agustina Rahmawati, S.A.P., M.Si.	1	2026-02-13 01:42:10.634475
8460	2817	Mei Maemunah, S.H., M.M.	2	2026-02-13 01:42:10.634475
8461	2818	Mei Maemunah, S.H., M.M.	0	2026-02-13 01:42:10.634475
8462	2818	Agustina Rahmawati, S.A.P., M.Si.	1	2026-02-13 01:42:10.634475
8463	2818	Hanantyo Sri Nugroho, S.IP., M.A.	2	2026-02-13 01:42:10.634475
8464	2819	Muhammad Zuhdan, S.I.P., M.A.	0	2026-02-13 01:42:10.634475
8465	2819	Ferri Wicaksono, S.I.P., M.A.	1	2026-02-13 01:42:10.634475
8466	2819	Hanantyo Sri Nugroho, S.IP., M.A.	2	2026-02-13 01:42:10.634475
8467	2820	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	0	2026-02-13 09:27:27.695539
8468	2820	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	1	2026-02-13 09:27:27.695539
8469	2820	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	2	2026-02-13 09:27:27.695539
8470	2821	Riski Damastuti, S.Sos., M.A.	0	2026-02-13 09:27:42.215261
8471	2821	Stara Asrita, S.I.Kom., M.A.	1	2026-02-13 09:27:42.215261
8472	2821	Monika Pretty Aprilia, S.I.P., M.Si.	2	2026-02-13 09:27:42.215261
8473	2822	Riski Damastuti, S.Sos., M.A.	0	2026-02-13 09:27:46.796336
8474	2822	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	1	2026-02-13 09:27:46.796336
8475	2822	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	2	2026-02-13 09:27:46.796336
8476	2823	Andreas Tri Pamungkas, S.Sos., M.A.	0	2026-02-13 09:28:02.009944
8477	2823	Anggun Anindya Sekarningrum, M.I.Kom	1	2026-02-13 09:28:02.009944
8478	2823	Riski Damastuti, S.Sos., M.A.	2	2026-02-13 09:28:02.009944
8479	2824	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	0	2026-02-13 09:28:05.288183
8480	2824	Wajar Bimantoro Suminto, Sn., M.Des	1	2026-02-13 09:28:05.288183
8481	2824	Riski Damastuti, S.Sos., M.A.	2	2026-02-13 09:28:05.288183
8482	2825	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	0	2026-02-13 09:28:22.878723
8483	2825	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	1	2026-02-13 09:28:22.878723
8484	2825	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-13 09:28:22.878723
8485	2826	Stara Asrita, S.I.Kom., M.A.	0	2026-02-13 09:28:25.448868
8486	2826	Bela Fataya Azmi, S.Kom.I., M.A.	1	2026-02-13 09:28:25.448868
8487	2826	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-13 09:28:25.448868
8488	2827	Andreas Tri Pamungkas, S.Sos., M.A.	0	2026-02-13 09:28:27.78042
8489	2827	Anggun Anindya Sekarningrum, M.I.Kom	1	2026-02-13 09:28:27.78042
8490	2827	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-13 09:28:27.78042
8491	2828	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	0	2026-02-13 09:28:29.935655
8492	2828	Stara Asrita, S.I.Kom., M.A.	1	2026-02-13 09:28:29.935655
8493	2828	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-13 09:28:29.935655
8494	2829	Wajar Bimantoro Suminto, Sn., M.Des	0	2026-02-13 09:28:36.491587
8495	2829	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	1	2026-02-13 09:28:36.491587
8496	2829	Stara Asrita, S.I.Kom., M.A.	2	2026-02-13 09:28:36.491587
8497	2830	Etik Anjar Fitriarti, S.I.Kom., M.A.	0	2026-02-13 09:28:38.428607
8498	2830	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	1	2026-02-13 09:28:38.428607
8499	2830	Yulinda Erlistyarini, S.I.Kom., M.Med.Kom.	2	2026-02-13 09:28:38.428607
8500	2831	Riski Damastuti, S.Sos., M.A.	0	2026-02-13 09:28:40.382292
8501	2831	Bela Fataya Azmi, S.Kom.I., M.A.	1	2026-02-13 09:28:40.382292
8502	2831	Zahrotus Sa'idah, S.I.Kom., M.A.	2	2026-02-13 09:28:40.382292
8503	2832	Junaidi, S.Ag., M.Hum, Dr.	0	2026-02-13 09:28:45.167971
8504	2832	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	1	2026-02-13 09:28:45.167971
8505	2832	Kadek Kiki Astria, S.I.Kom., M.A.	2	2026-02-13 09:28:45.167971
8506	2833	Wajar Bimantoro Suminto, Sn., M.Des	0	2026-02-13 09:28:45.167971
8507	2833	Devi Wening Astari, M.I.Kom	1	2026-02-13 09:28:45.167971
8508	2833	Anggun Anindya Sekarningrum, M.I.Kom	2	2026-02-13 09:28:45.167971
8509	2834	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	0	2026-02-13 09:28:45.167971
8510	2834	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	1	2026-02-13 09:28:45.167971
8511	2834	Nurfian Yudhistira, S.I.Kom., M.A.	2	2026-02-13 09:28:45.167971
8512	2835	Nurfian Yudhistira, S.I.Kom., M.A.	0	2026-02-13 09:28:45.167971
8513	2835	Wajar Bimantoro Suminto, Sn., M.Des	1	2026-02-13 09:28:45.167971
8514	2835	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2	2026-02-13 09:28:45.167971
8515	2836	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	0	2026-02-13 09:28:45.167971
8516	2836	Nurfian Yudhistira, S.I.Kom., M.A.	1	2026-02-13 09:28:45.167971
8517	2836	Anggun Anindya Sekarningrum, M.I.Kom	2	2026-02-13 09:28:45.167971
8518	2837	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	0	2026-02-13 09:28:45.167971
8519	2837	Nurfian Yudhistira, S.I.Kom., M.A.	1	2026-02-13 09:28:45.167971
8520	2837	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2	2026-02-13 09:28:45.167971
8521	2838	Devi Wening Astari, M.I.Kom	0	2026-02-13 09:28:45.167971
8522	2838	Wajar Bimantoro Suminto, Sn., M.Des	1	2026-02-13 09:28:45.167971
8523	2838	Andreas Tri Pamungkas, S.Sos., M.A.	2	2026-02-13 09:28:45.167971
8524	2839	Stara Asrita, S.I.Kom., M.A.	0	2026-02-13 09:28:45.167971
8525	2839	Wiwid Adiyanto, A.Md., S.I.Kom., M.I.Kom.	1	2026-02-13 09:28:45.167971
8526	2839	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	2	2026-02-13 09:28:45.167971
8527	2840	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	0	2026-02-13 09:28:45.167971
8528	2840	Stara Asrita, S.I.Kom., M.A.	1	2026-02-13 09:28:45.167971
8529	2840	Etik Anjar Fitriarti, S.I.Kom., M.A.	2	2026-02-13 09:28:45.167971
8530	2841	Erfina Nurussa'adah, S.Kom.I., M.I.Kom.	0	2026-02-13 09:28:45.167971
8531	2841	Devi Wening Astari, M.I.Kom	1	2026-02-13 09:28:45.167971
8532	2841	Bela Fataya Azmi, S.Kom.I., M.A.	2	2026-02-13 09:28:45.167971
8533	2842	Rosyidah Jayanti Vijaya, S.E, M.Hum	0	2026-02-13 09:28:45.167971
8534	2842	Alvian Alrasid Ajibulloh, S.I.Kom., M.I.Kom.	1	2026-02-13 09:28:45.167971
8535	2842	Bela Fataya Azmi, S.Kom.I., M.A.	2	2026-02-13 09:28:45.167971
8536	2843	Rufki Ade Vinanda, S.I.Kom., M.A.	0	2026-02-13 09:28:45.167971
8537	2843	Bela Fataya Azmi, S.Kom.I., M.A.	1	2026-02-13 09:28:45.167971
8538	2843	Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom.	2	2026-02-13 09:28:45.167971
8539	2844	Dr. Nurbayti, S.I.Kom., M.A.	0	2026-02-13 09:28:45.167971
8540	2844	Rivga Agusta, S.I.P., M.A.	1	2026-02-13 09:28:45.167971
8541	2844	Anggun Anindya Sekarningrum, M.I.Kom	2	2026-02-13 09:28:45.167971
8542	2845	Rufki Ade Vinanda, S.I.Kom., M.A.	0	2026-02-13 09:28:45.167971
8543	2845	Rosyidah Jayanti Vijaya, S.E, M.Hum	1	2026-02-13 09:28:45.167971
8544	2845	Andreas Tri Pamungkas, S.Sos., M.A.	2	2026-02-13 09:28:45.167971
8545	2846	Yusuf Amri Amrullah, S.E., M.M.	0	2026-02-13 11:10:23.096498
8546	2846	Dr. Reza Widhar Pahlevi, S.E., M.M.	1	2026-02-13 11:10:23.096498
8547	2846	Dinda Sukmaningrum, S.T., M.M	2	2026-02-13 11:10:23.096498
8551	2848	Atika Fatimah, S.E., M.Ec.Dev.	0	2026-02-13 11:16:27.30187
8552	2848	Anik Sri Widawati, S.Sos., M.M.	1	2026-02-13 11:16:27.30187
8553	2848	Istiningsih, S.E., M.M.	2	2026-02-13 11:16:27.30187
8554	2849	Rr. Pramesthi Ratnaningtyas, S.Sos., M.A.	0	2026-02-13 12:29:06.306306
8555	2849	Novita Ika Purnama Sari, S.I.Kom., M.A.	1	2026-02-13 12:29:06.306306
8556	2849	Riski Damastuti, S.Sos., M.A.	2	2026-02-13 12:29:06.306306
8557	2850	Narwanto Nurcahyo, S.H., M.M.	0	2026-02-13 15:54:27.542804
8558	2850	Dr. Dodi Setiawan Riatmaja, S.Psi., M.B.A.	1	2026-02-13 15:54:27.542804
8559	2850	Yusuf Amri Amrullah, S.E., M.M.	2	2026-02-13 15:54:27.542804
8560	2851	Dr. Dodi Setiawan Riatmaja, S.Psi., M.B.A.	0	2026-02-13 15:54:37.459766
8561	2851	Rahma Widyawati, S.E., M.M.	1	2026-02-13 15:54:37.459766
8562	2851	Yusuf Amri Amrullah, S.E., M.M.	2	2026-02-13 15:54:37.459766
8563	2852	Dinda Sukmaningrum, S.T., M.M	0	2026-02-13 15:54:40.503713
8564	2852	Dr. Dodi Setiawan Riatmaja, S.Psi., M.B.A.	1	2026-02-13 15:54:40.503713
8565	2852	Laksmindra Saptyawati, S.E., M.B.A.	2	2026-02-13 15:54:40.503713
8566	2853	Laksmindra Saptyawati, S.E., M.B.A.	0	2026-02-13 15:54:43.915874
8567	2853	Dodi Setiawan R, S.Psi, MBA, Dr.	1	2026-02-13 15:54:43.915874
8568	2853	Yusuf Amri Amrullah, S.E., M.M.	2	2026-02-13 15:54:43.915874
8569	2854	Dr. Dodi Setiawan Riatmaja, S.Psi., M.B.A.	0	2026-02-13 15:54:46.718865
8570	2854	Nurhayanto, S.E., M.B.A.	1	2026-02-13 15:54:46.718865
8571	2854	Yusuf Amri Amrullah, S.E., M.M.	2	2026-02-13 15:54:46.718865
8572	2855	Dr. Dodi Setiawan Riatmaja, S.Psi., M.B.A.	0	2026-02-13 15:54:49.455787
8573	2855	Laksmindra Saptyawati, S.E., M.B.A.	1	2026-02-13 15:54:49.455787
8574	2855	Dr. Reza Widhar Pahlevi, S.E., M.M.	2	2026-02-13 15:54:49.455787
\.


--
-- Data for Name: slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.slots (id, date, "time", room, student, mahasiswa_nim, created_at, updated_at) FROM stdin;
2616	2026-02-25	08:30	5.2.4	Annahda Djafniel Yudanur	22.96.3485	2026-02-12 14:23:25.177772	2026-02-12 14:23:25.177772
2618	2026-02-23	10:00	5.2.4	SINTIA AGUSTINA	22.96.2973	2026-02-12 14:23:59.451832	2026-02-12 14:23:59.451832
2620	2026-02-23	13:00	5.2.4	Darin Fahriyal Merry	22.96.3261	2026-02-12 14:24:05.72692	2026-02-12 14:24:05.72692
2622	2026-02-24	10:00	5.2.4	HIJRIAH NURNANINGSIH	22.96.3430	2026-02-12 14:24:09.120991	2026-02-12 14:24:09.120991
2624	2026-02-24	13:00	5.2.4	DIVANIA SOFIE MAYLINA PUTRI	22.96.3534	2026-02-12 14:24:12.249173	2026-02-12 14:24:12.249173
2628	2026-03-02	08:30	5.2.4	KORNELIA NOVASARI	22.96.3038	2026-02-12 14:24:26.134445	2026-02-12 14:24:26.134445
2632	2026-02-18	08:30	5.2.4	Muhammad Adib Fikri L	19.96.1056	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2633	2026-02-18	10:00	5.2.4	Dhimas Arjuna Nur Kuncoro	20.96.2209	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2634	2026-02-18	10:00	5.2.5	NASYA AZZAHRA	21.96.2614	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2635	2026-02-18	11:30	5.2.4	VISHUNATAN JUNSI KRISTA PUTRA	22.96.3337	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2636	2026-02-18	08:30	5.2.5	TRIADINDA DEWI FORTUNA	19.96.1281	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2637	2026-02-18	10:00	5.2.6	HANDY ALDIAWAN	19.96.1692	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2638	2026-02-18	08:30	5.2.6	HERBAGAS BAGUS TARUNA	20.96.1768	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2641	2026-02-18	11:30	5.2.6	Nada Krisyifa Oktaviani	20.96.2009	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2644	2026-02-18	13:00	5.2.5	HANUM ARI PRIHANDINI	21.96.2268	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2645	2026-02-18	13:00	5.2.6	ALEXSANDER GENO	21.96.2279	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2647	2026-02-19	08:30	5.2.5	Muhammad Ibra Fahrezi	21.96.2362	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2648	2026-02-18	13:00	5.2.7	ERICKO WAKHID FITRIANTO	21.96.2568	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2649	2026-02-19	08:30	5.2.6	DANANG PRAMUDYA BAIHAQI	21.96.2622	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2654	2026-02-18	10:00	5.2.8	ILYAS SETYAWAN	21.96.2679	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2655	2026-02-18	11:30	5.2.8	BAYU IRWANA	21.96.2685	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2656	2026-02-19	10:00	5.2.6	ABU REIKHAN ALFARISI ZUFRI	21.96.2700	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2657	2026-02-19	10:00	5.2.7	ANDITYA AKBAR HERTANDI	21.96.2712	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2658	2026-02-19	11:30	5.2.4	OCTAVIANA ADELLA PUTRI	21.96.2778	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2659	2026-02-19	13:00	5.2.4	QAIS AS SYAFI'I	21.96.2843	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2660	2026-02-18	13:00	5.2.8	DITA CAHYANINGRUM	21.96.2858	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2661	2026-02-19	11:30	5.2.5	VANIA NIDIA GANTARI	22.67.0059	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2662	2026-02-19	11:30	5.2.6	KLAUDIA PUTRI AMELIA TANDI	22.96.2899	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2663	2026-02-19	10:00	5.2.8	RAIHAN ALHARITS	22.96.2902	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2666	2026-02-19	13:00	5.2.5	AGUNG PANGESTU	22.96.2944	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2667	2026-02-19	13:00	5.2.6	FIKRI ZULKARNAIN	22.96.2955	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2668	2026-02-20	08:30	5.2.4	Yassar Ibni Maulana	22.96.2956	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2669	2026-02-24	08:30	5.2.6	MELINDA KUSUMA PUTRI	22.96.2995	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2670	2026-02-20	10:00	5.2.4	AURELIUS FELIZ ERGI NATIVIDAD	22.96.3000	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2672	2026-02-23	08:30	5.2.5	MEISHAFIRA PUTRI HERDANA	22.96.3015	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2673	2026-02-19	13:00	5.2.8	PAULINA NIRMALA DANU	22.96.3058	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2674	2026-02-20	08:30	5.2.5	AKID SETYO RAHARJO	22.96.3061	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2675	2026-02-20	08:30	5.2.6	Gilang Kusuma Ramdani	22.96.3072	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2677	2026-02-23	10:00	5.2.5	Bima Samudra	22.96.3090	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2678	2026-02-20	13:00	5.2.4	MUHAMMAD ALBAN	22.96.3092	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2679	2026-02-24	10:00	5.2.5	Muhammad Raihan Nur Fathiyya	22.96.3120	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2681	2026-02-20	13:00	5.2.5	SHAFIRA MAYLANI	22.96.3140	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2682	2026-02-20	10:00	5.2.6	MUHAMMAD BILLAL	22.96.3154	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2683	2026-02-20	10:00	5.2.7	SALSA BELA BUDI UTAMI	22.96.3155	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2686	2026-02-20	13:00	5.2.6	AUREA CHERRISA DESIDERIA	22.96.3174	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2687	2026-02-20	10:00	5.2.8	REVASYA ARNES ARIAMANDA	22.96.3176	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2689	2026-02-18	08:30	5.2.8	ROSIDA AMALIA	22.96.3206	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2690	2026-02-19	08:30	5.2.8	ERSANDA PUTRI MINA SETYORINI	22.96.3207	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2692	2026-02-23	08:30	5.2.6	ALYA NURUL RAHMADINA	22.96.3244	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2693	2026-02-23	08:30	5.2.7	LAELA NURMALITA SARI	22.96.3259	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2695	2026-02-23	10:00	5.2.7	DESINTA MAHARANI	22.96.3268	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2696	2026-02-23	10:00	5.2.8	OLGA NARADINDA	22.96.3271	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2697	2026-02-23	11:30	5.2.5	ERLINA DWI NOERMA	22.96.3274	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2698	2026-02-23	11:30	5.2.6	WINDA AYU FITASARI	22.96.3275	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2699	2026-02-23	11:30	5.2.7	Naufal Daffa Saputra	22.96.3277	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2849	2026-03-03	10:00	5.2.1	Novita Anggraeni	20.96.1794	2026-02-13 12:29:06.306306	2026-02-13 12:29:06.306306
2617	2026-02-23	08:30	5.2.4	IKHSANUL AMAL	20.96.1853	2026-02-12 14:23:50.993478	2026-02-12 14:23:50.993478
2619	2026-02-23	11:30	5.2.4	TERESA ESKAVI SONDA	22.96.3256	2026-02-12 14:24:03.966676	2026-02-12 14:24:03.966676
2621	2026-02-24	08:30	5.2.4	SALMA FAIZ MAULIDA PUTRI	22.96.3292	2026-02-12 14:24:07.364739	2026-02-12 14:24:07.364739
2623	2026-02-24	11:30	5.2.4	RESTI KURNIAWATI	22.96.3518	2026-02-12 14:24:10.741252	2026-02-12 14:24:10.741252
2627	2026-02-24	13:00	5.2.5	Aimee Nuansa Azura R.	21.96.2608	2026-02-12 14:24:23.19951	2026-02-12 14:24:23.19951
2629	2026-03-02	10:00	5.2.4	FITRIANI RAHMAN	22.96.3511	2026-02-12 14:24:27.960728	2026-02-12 14:24:27.960728
2701	2026-02-24	10:00	5.2.6	FLADINTYA RACHEL ISLAMI	22.96.3316	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2702	2026-02-23	13:00	5.2.5	RAFIFA AMALDHIA PUTRI	22.96.3319	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2704	2026-02-24	08:30	5.2.7	RISTA PUTRI EKA PERTIWI	22.96.3325	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2705	2026-02-24	10:00	5.2.7	HAIDAR KRESNA PAMUJI	22.96.3326	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2706	2026-02-23	13:00	5.2.7	NOFIKASARI	22.96.3329	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2709	2026-02-24	11:30	5.2.6	AUDELINE PUTRI PRAMESYA	22.96.3357	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2710	2026-02-23	13:00	5.2.8	Sayu Farrah Bisawamila	22.96.3362	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2711	2026-02-24	11:30	5.2.7	FIQA SUCI ARFIA SAHARANI	22.96.3370	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2712	2026-02-24	13:00	5.2.6	BILQYSSA BIANCHA PUTRI RYANTI	22.96.3371	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2713	2026-02-24	11:30	5.2.8	TASYA TIAS NUGRAHENI	22.96.3374	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2714	2026-02-24	13:00	5.2.7	FADHIL WINNES GALAEH PRATAMA	22.96.3378	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2715	2026-02-24	13:00	5.2.8	DHIYA ULHAQ SAFINATUN NAJAH	22.96.3386	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2716	2026-02-25	08:30	5.2.5	GATHAN OKTARIANSYAH	22.96.3391	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2717	2026-02-25	10:00	5.2.4	SEPTIANA AKTHER PATWARY	22.96.3396	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2718	2026-02-25	08:30	5.2.6	ABIE DIKA BINTANG PUTRA	22.96.3398	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2719	2026-02-25	10:00	5.2.5	ANGELIA MAHARANI WIRAPUTERI	22.96.3405	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2720	2026-02-25	08:30	5.2.7	AULIA JASMIN HANIFAH	22.96.3423	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2722	2026-02-25	10:00	5.2.6	Arsha Haroun Al Rasyid	22.96.3440	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2723	2026-02-25	11:30	5.2.4	FALAH RAHMAN KURNIASYAH	22.96.3443	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2724	2026-02-25	13:00	5.2.4	EMMIE LISTIANA	22.96.3450	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2725	2026-02-26	08:30	5.2.4	FITRIANI	22.96.3455	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2726	2026-02-26	10:00	5.2.4	Calvin Destyan Pradana	22.96.3456	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2727	2026-02-25	10:00	5.2.7	Irfan Gunawan	22.96.3462	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2728	2026-02-25	10:00	5.2.8	MUHAMMAD RAFI LAZUARDI	22.96.3481	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2729	2026-02-25	11:30	5.2.5	MUHAMMAD FANDI NUR SETYWAN	22.96.3483	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2730	2026-02-25	11:30	5.2.6	ZA'IM MUTHAHARI	22.96.3497	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2731	2026-02-25	13:00	5.2.5	RAYHAN RACHMAN HAKIM	22.96.3517	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2732	2026-02-25	13:00	5.2.6	FIGO EKA PRADHIKA	22.96.3523	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2733	2026-02-25	11:30	5.2.7	INTAN NURSANTI NUGROHO	22.96.3542	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2734	2026-02-25	11:30	5.2.8	ANNISA ALWI SYAHIDAH	22.96.3548	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2735	2026-02-25	13:00	5.2.7	DHESTA KURNIA ATANINGRUM	22.96.3551	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2736	2026-02-26	08:30	5.2.5	ADILLA FITRIA SURYANI	22.96.3571	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2737	2026-02-26	08:30	5.2.6	FAAIZ DAFFA FATHAN F.	22.96.3578	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2738	2026-02-25	13:00	5.2.8	SELSA KATRI EKADEWI	22.96.3603	2026-02-12 14:35:58.047488	2026-02-12 14:35:58.047488
2739	2026-02-26	08:30	5.2.7	RIZKI LEKSY REYNALDO	19.96.1077	2026-02-12 14:46:51.355576	2026-02-12 14:46:51.355576
2740	2026-02-26	10:00	5.2.5	Kolonius Octoviery Bayu Adwiandy Puryadi	21.96.2502	2026-02-12 14:46:51.355576	2026-02-12 14:46:51.355576
2741	2026-03-03	08:30	5.2.4	MUHAMMAD FAIZ JORDAN	21.96.2841	2026-02-12 14:46:51.355576	2026-02-12 14:46:51.355576
2742	2026-02-26	11:30	5.2.4	RAKHA DAMONZA YODIANSYAH	22.96.3445	2026-02-12 14:46:51.355576	2026-02-12 14:46:51.355576
2743	2026-02-26	13:00	5.2.4	MUHAMMAD NAWAWI MUDA SEMIRI	22.96.3547	2026-02-12 15:32:15.680946	2026-02-12 15:32:15.680946
2744	2026-02-18	08:30	5.2.1	Rifki Wahyu Pratama	21.85.0151	2026-02-12 15:49:36.45876	2026-02-12 15:49:36.45876
2745	2026-02-18	10:00	5.2.1	Hadam Cahya Ramadhan	21.85.0157	2026-02-12 15:49:36.45876	2026-02-12 15:49:36.45876
2746	2026-02-18	11:30	5.2.1	KUKUH	22.85.0173	2026-02-12 15:49:36.45876	2026-02-12 15:49:36.45876
2747	2026-02-18	13:00	5.2.1	Alif Ridwan Ariyanto	22.85.1177	2026-02-12 15:49:36.45876	2026-02-12 15:49:36.45876
2748	2026-02-18	08:30	5.2.2	Claudia Indasari Jena	21.86.0216	2026-02-12 15:55:29.699797	2026-02-12 15:55:29.699797
2749	2026-02-18	10:00	5.2.2	Wiwin Royani Umasugi	22.86.0224	2026-02-12 15:55:29.699797	2026-02-12 15:55:29.699797
2750	2026-02-18	11:30	5.2.2	Vrisna Nabilla	22.86.0233	2026-02-12 15:55:29.699797	2026-02-12 15:55:29.699797
2751	2026-02-18	13:00	5.2.2	Audyna Listiyo Wati	22.86.0237	2026-02-12 15:55:29.699797	2026-02-12 15:55:29.699797
2752	2026-02-19	08:30	5.2.1	Adelia Wulandari	22.86.0271	2026-02-12 15:55:29.699797	2026-02-12 15:55:29.699797
2753	2026-02-19	10:00	5.2.1	Nur Mayangsari	22.86.0273	2026-02-12 15:55:29.699797	2026-02-12 15:55:29.699797
2754	2026-02-18	08:30	5.2.3	algaffary dnio rahmadian	19.92.0211	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2755	2026-02-18	10:00	5.2.3	Wisnu Jati Nugroho	20.92.0226	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2756	2026-02-20	08:30	5.2.1	HAFIFUDDIN	20.92.0256	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2757	2026-02-18	11:30	5.2.3	Melati Sekar Waditra	20.92.0282	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2758	2026-02-18	13:00	5.2.3	Radenroro Nilam Sophia Puti Dayu	20.92.0295	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2759	2026-02-19	08:30	5.2.2	Muhammad Rifqi Pratama	21.92.0325	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2761	2026-02-19	10:00	5.2.3	PENI HANA ZUSTIKA	21.92.0404	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2762	2026-02-20	10:00	5.2.1	MUNAA KHOIRUL UMAM	22.92.0428	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2763	2026-02-20	13:00	5.2.1	VEMAS ALVITO SIGARSIA	22.92.0433	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2764	2026-02-23	08:30	5.2.1	SEPTIAN HERU KURNIAWAN	22.92.0438	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2765	2026-02-19	08:30	5.2.3	ALVIAN WAHYU TSANI	22.92.0439	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2767	2026-02-23	11:30	5.2.1	INTAN ANINDITA NURBAITI	22.92.0443	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2768	2026-02-19	11:30	5.2.1	Muhammad Zaidan Hasaniputra	22.92.0447	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2770	2026-02-20	08:30	5.2.2	Siva Aulia Sekar Langit	22.92.0459	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2771	2026-02-23	10:00	5.2.2	DIMAS RIZKY TRISAKTI PB	22.92.0460	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2772	2026-02-19	13:00	5.2.2	Haifa Nafillah Kholda	22.92.0465	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2777	2026-02-19	11:30	5.2.2	INDAH KESIANA DEWI	22.92.0473	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2778	2026-02-23	13:00	5.2.1	ELSA VIYANA SARI	22.92.0477	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2779	2026-02-24	08:30	5.2.1	UMI KHABIBAH	22.92.0490	2026-02-13 01:22:16.749097	2026-02-13 01:22:16.749097
2780	2026-02-19	11:30	5.2.3	Oktaviani Dwi Puspita	19.93.0113	2026-02-13 01:28:19.974733	2026-02-13 01:28:19.974733
2781	2026-02-19	13:00	5.2.3	MARCELINO FIRDAUS	19.93.0121	2026-02-13 01:28:19.974733	2026-02-13 01:28:19.974733
2782	2026-02-23	08:30	5.2.3	Arif Bagus Pramudi	21.93.0242	2026-02-13 01:28:19.974733	2026-02-13 01:28:19.974733
2783	2026-02-23	10:00	5.2.3	RADEN USMAN NUZQI RAMADHAN	21.93.0251	2026-02-13 01:28:19.974733	2026-02-13 01:28:19.974733
2784	2026-02-20	10:00	5.2.3	BERLIAN ABELITA HENDRAWATI	22.93.0322	2026-02-13 01:28:19.974733	2026-02-13 01:28:19.974733
2785	2026-02-20	13:00	5.2.3	SILVIA DEWI RAMAWATI	19.95.0146	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2786	2026-02-23	11:30	5.2.2	ENJELITHA	19.95.0163	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2787	2026-02-23	13:00	5.2.2	Julian Agung Prasetyo	19.95.0175	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2788	2026-02-24	08:30	5.2.2	LALU M. ALFAN SAORI	19.95.0176	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2789	2026-02-24	10:00	5.2.1	Mya kustanti	20.95.0203	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2790	2026-02-24	11:30	5.2.1	NUR ISA MELIYANTI	20.95.0209	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2791	2026-02-24	10:00	5.2.2	Tri Utami	20.95.0238	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2792	2026-02-24	13:00	5.2.1	Feronika Dian Fatihah	20.95.0239	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2793	2026-02-25	08:30	5.2.1	Rendry Rahama Sulaga	20.95.0244	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2794	2026-02-25	10:00	5.2.1	FARSYA MAHARANI	21.95.0311	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2795	2026-02-25	11:30	5.2.1	YOSEP KURNIAWAN	22.95.0354	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2796	2026-02-25	13:00	5.2.1	Aisyah Ahlaqul Alexandra Setiawan	22.95.0392	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2797	2026-02-26	08:30	5.2.1	Muizmu Sallajul Iqbal	22.95.0406	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2798	2026-02-27	08:30	5.2.1	INDAH DWI RAHMAWATI	22.95.0410	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2799	2026-02-27	10:00	5.2.1	Salma Semesta	22.95.0432	2026-02-13 01:32:38.228292	2026-02-13 01:32:38.228292
2800	2026-03-02	08:30	5.2.1	Robet Harjiyanto Rastamaji	19.91.0105	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2801	2026-03-02	10:00	5.2.1	Muhammad Muadz Albaihaqi	21.91.0203	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2802	2026-02-23	11:30	5.2.3	Zidan Alfi Kautsar	21.94.0241	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2803	2026-03-02	11:30	5.2.1	Futiara Aturrohmah	22.91.0228	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2804	2026-03-02	13:00	5.2.1	Vara Fadila Agustin	22.91.0233	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2805	2026-02-23	13:00	5.2.3	Sherly Anggiliana Puspitasari	22.91.0249	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2806	2026-03-03	08:30	5.2.1	Sophia Myska Amira	22.91.0258	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2807	2026-03-02	10:00	5.2.2	Nagisa Zanura	22.91.0261	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2808	2026-03-02	11:30	5.2.2	Fitri Ramadhani	22.91.0276	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2809	2026-02-24	08:30	5.2.3	Angistiya Pinakesti	22.94.0243	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2810	2026-02-24	10:00	5.2.3	JESICHA MANDHANCE AURRELIA MAHA DEWIE	22.94.0246	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2811	2026-02-24	11:30	5.2.2	Rizka Sakti Eka Pambudi	22.94.0264	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2812	2026-02-24	13:00	5.2.2	AZZAHRA NUR OKTAVIANA	22.94.0280	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2813	2026-02-25	08:30	5.2.2	Sukma Karunia Alam	22.94.0284	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2814	2026-02-25	10:00	5.2.2	Lovisa Veranica	22.94.0285	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2815	2026-02-25	11:30	5.2.2	Herlina Handastari	22.94.0289	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2816	2026-02-24	11:30	5.2.3	Elita Zena Pratista Arta Mulia	22.94.0295	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2817	2026-02-24	13:00	5.2.3	Vina Aliya Farhatayni	22.94.0296	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2818	2026-02-25	13:00	5.2.2	Sahirah Nur Hanifah	22.94.0301	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2819	2026-02-26	08:30	5.2.2	FIORELIA CHAIRUNNISA CHANDRA	22.94.0308	2026-02-13 01:42:10.634475	2026-02-13 01:42:10.634475
2820	2026-02-24	08:30	5.2.5	WILLY ADRIEL PUTRA WARDANA	20.96.1734	2026-02-13 09:27:27.695539	2026-02-13 09:27:27.695539
2821	2026-02-18	08:30	5.2.7	ALISHA LARASATI UTOMO	20.96.2114	2026-02-13 09:27:42.215261	2026-02-13 09:27:42.215261
2822	2026-02-24	11:30	5.2.5	SHARLA PUTRI ARDHANA	21.96.2448	2026-02-13 09:27:46.796336	2026-02-13 09:27:46.796336
2823	2026-02-18	10:00	5.2.7	Saif Arkan Arib Maulana	20.96.1804	2026-02-13 09:28:02.009944	2026-02-13 09:28:02.009944
2824	2026-02-18	11:30	5.2.5	Wizza Ardha Kencana	20.96.2191	2026-02-13 09:28:05.288183	2026-02-13 09:28:05.288183
2825	2026-02-18	11:30	5.2.7	THERESIA TAMARA HARYUNINGRUM	21.96.2337	2026-02-13 09:28:22.878723	2026-02-13 09:28:22.878723
2826	2026-02-19	08:30	5.2.4	NUUR ANGGRAINI KUSUMAAWATI	22.96.2941	2026-02-13 09:28:25.448868	2026-02-13 09:28:25.448868
2827	2026-02-19	10:00	5.2.4	AGUSTINA STHELLA MEBANG	22.96.3320	2026-02-13 09:28:27.78042	2026-02-13 09:28:27.78042
2828	2026-02-19	11:30	5.2.7	TANAYA MUTIARA NURDIANSYAH	22.96.3338	2026-02-13 09:28:29.935655	2026-02-13 09:28:29.935655
2829	2026-02-20	08:30	5.2.7	RAYHAN DANI WICAKSONO	21.96.2656	2026-02-13 09:28:36.491587	2026-02-13 09:28:36.491587
2830	2026-02-23	10:00	5.2.6	NAGITA DEVINA IMANDASARI	22.96.3343	2026-02-13 09:28:38.428607	2026-02-13 09:28:38.428607
2831	2026-02-18	13:00	5.2.4	EVANDRA HUDA PRADIPTA	22.96.3199	2026-02-13 09:28:40.382292	2026-02-13 09:28:40.382292
2832	2026-02-23	08:30	5.2.8	DAFA AZZAHRA PUTRA	20.96.1995	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2833	2026-02-19	08:30	5.2.7	MUHAMMAD FACHRIANSYAH	21.96.2629	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2834	2026-02-19	10:00	5.2.5	Gakkoi Ardianta	21.96.2635	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2835	2026-02-19	13:00	5.2.7	Muhammad Irfan Firdaus Al Aqsha	21.96.2662	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2836	2026-02-19	11:30	5.2.8	ANNISA MALIKA AKBAR	22.96.2914	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2837	2026-02-20	08:30	5.2.8	MUHAMMAD ARRASIT	22.96.3010	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2838	2026-02-20	10:00	5.2.5	Fidhal Fahruq Muadzlam Wahab	22.96.3079	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2839	2026-02-20	13:00	5.2.7	CHEVINTA OTIS PARAMYTHA	22.96.3133	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2840	2026-02-23	11:30	5.2.8	AURA SYIFA NUR FADHILAH	22.96.3161	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2841	2026-02-20	13:00	5.2.8	AULIA FREZA FITRIANI	22.96.3164	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2842	2026-02-23	13:00	5.2.6	PUTRI ENDINA EKA CAHYANI	22.96.3215	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2846	2026-02-26	08:30	5.2.3	PAULINA ANUGRAHNI	22.92.0468	2026-02-13 11:10:23.096498	2026-02-13 11:10:23.096498
2848	2026-02-20	08:30	5.2.3	BAGAS KURNIAWAN	21.91.0186	2026-02-13 11:16:27.30187	2026-02-13 11:16:27.30187
2843	2026-02-24	10:00	5.2.8	FADHILLA NUR FAJRIYAH	22.96.3266	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2844	2026-02-25	08:30	5.2.8	VERANIKA AULIA AGATHA	22.96.3314	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2845	2026-02-24	08:30	5.2.8	Puti Cinta Novtazulfa	22.96.3438	2026-02-13 09:28:45.167971	2026-02-13 09:28:45.167971
2850	2026-02-20	13:00	5.2.2	A RIZAL E SOALOON LUBIS	21.92.0363	2026-02-13 15:54:27.542804	2026-02-13 15:54:27.542804
2851	2026-02-25	08:30	5.2.3	Gustiano Aditya Gunawan	22.92.0442	2026-02-13 15:54:37.459766	2026-02-13 15:54:37.459766
2852	2026-02-20	10:00	5.2.2	Mayra Putri Juliana	22.92.0448	2026-02-13 15:54:40.503713	2026-02-13 15:54:40.503713
2853	2026-02-25	10:00	5.2.3	Faiz Karima	22.92.0466	2026-02-13 15:54:43.915874	2026-02-13 15:54:43.915874
2854	2026-02-25	11:30	5.2.3	MELANI SALSABILA	22.92.0469	2026-02-13 15:54:46.718865	2026-02-13 15:54:46.718865
2855	2026-02-25	13:00	5.2.3	Maranti Suryaningsih	22.92.0471	2026-02-13 15:54:49.455787	2026-02-13 15:54:49.455787
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role, last_login, created_at) FROM stdin;
1	admin	$2b$10$lB85y6tGzN.NQ5NixtayQuvAdNqD93ZdB5AjB3H1.IFWMEYeHaHDK	admin	2026-02-13 14:35:16.871874	2026-02-06 14:34:17.686633
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 366, true);


--
-- Name: dosen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dosen_id_seq', 295, true);


--
-- Name: libur_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.libur_id_seq', 357, true);


--
-- Name: mahasiswa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mahasiswa_id_seq', 6792, true);


--
-- Name: master_dosen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.master_dosen_id_seq', 423, true);


--
-- Name: slot_examiners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.slot_examiners_id_seq', 8574, true);


--
-- Name: slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.slots_id_seq', 2855, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (setting_key);


--
-- Name: dosen dosen_nik_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dosen
    ADD CONSTRAINT dosen_nik_key UNIQUE (nik);


--
-- Name: dosen dosen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dosen
    ADD CONSTRAINT dosen_pkey PRIMARY KEY (id);


--
-- Name: libur libur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libur
    ADD CONSTRAINT libur_pkey PRIMARY KEY (id);


--
-- Name: mahasiswa mahasiswa_nim_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mahasiswa
    ADD CONSTRAINT mahasiswa_nim_key UNIQUE (nim);


--
-- Name: mahasiswa mahasiswa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mahasiswa
    ADD CONSTRAINT mahasiswa_pkey PRIMARY KEY (id);


--
-- Name: master_dosen master_dosen_nik_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_dosen
    ADD CONSTRAINT master_dosen_nik_key UNIQUE (nik);


--
-- Name: master_dosen master_dosen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_dosen
    ADD CONSTRAINT master_dosen_pkey PRIMARY KEY (id);


--
-- Name: slot_examiners slot_examiners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slot_examiners
    ADD CONSTRAINT slot_examiners_pkey PRIMARY KEY (id);


--
-- Name: slots slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT slots_pkey PRIMARY KEY (id);


--
-- Name: slots unique_slot; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT unique_slot UNIQUE (date, "time", room);


--
-- Name: slots unique_slot_date_time_room; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT unique_slot_date_time_room UNIQUE (date, "time", room);


--
-- Name: slot_examiners unique_slot_examiner; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slot_examiners
    ADD CONSTRAINT unique_slot_examiner UNIQUE (slot_id, examiner_name);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_dosen_exclude; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dosen_exclude ON public.dosen USING btree (exclude);


--
-- Name: idx_dosen_nik; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dosen_nik ON public.dosen USING btree (nik);


--
-- Name: idx_examiner_slot; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_examiner_slot ON public.slot_examiners USING btree (slot_id);


--
-- Name: idx_libur_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_libur_date ON public.libur USING btree (date);


--
-- Name: idx_libur_dosen_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_libur_dosen_name ON public.libur USING btree (dosen_name);


--
-- Name: idx_libur_nik; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_libur_nik ON public.libur USING btree (nik);


--
-- Name: idx_mahasiswa_nim; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mahasiswa_nim ON public.mahasiswa USING btree (nim);


--
-- Name: idx_nik; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nik ON public.master_dosen USING btree (nik);


--
-- Name: idx_nim; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nim ON public.mahasiswa USING btree (nim);


--
-- Name: idx_slots_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_slots_date ON public.slots USING btree (date);


--
-- Name: idx_slots_date_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_slots_date_time ON public.slots USING btree (date, "time");


--
-- Name: slot_examiners trigger_check_examiner_quota; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_check_examiner_quota BEFORE INSERT ON public.slot_examiners FOR EACH ROW EXECUTE FUNCTION public.check_examiner_quota();


--
-- Name: slot_examiners slot_examiners_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slot_examiners
    ADD CONSTRAINT slot_examiners_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.slots(id) ON DELETE CASCADE;


--
-- Name: slots slots_mahasiswa_nim_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT slots_mahasiswa_nim_fkey FOREIGN KEY (mahasiswa_nim) REFERENCES public.mahasiswa(nim) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict opKaXYc9q7FK00ob0wmpm5tufmFPiyv61cNB8frIZZ3R9Lck66KzWOPvi5Pb5fg

