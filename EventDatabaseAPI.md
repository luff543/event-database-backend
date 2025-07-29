Event Database APIs
=================================

## Contents

- [Activity APIs](#activity)
    - [`GET /activity` Search activity](#get_search_activity)
    - [`GET /activity/histogram` Get activity histogram](#get_search_activity_histogram)
    - [`GET /activity/date-histogram` Get activity date histogram](#get_search_activity_date_histogram) 
- [FB Event Post APIs](#FB_Event_Post)
    - [`GET /event` Search FB Event Post](#get_search_event_post)
    - [`GET /event/histogram` Get FB Event Post histogram](#get_search_event_post_histogram)
- [Extracted Event from FB Post APIs](#Extracted_Event_from_FB_Post)
    - [`GET /extracted_event` Search extracted event from FB post](#get_search_extracted_event)

# History

- 2025 May 11th:
	- Add `GET /activity/date-histogram` API for activity time-based aggregation with support for interval, timezone, and filtering by city, category, type, and keyword.
- 2022 May 14th:
	- Event search/statistics API 
added the description of the type/from/to parameter field.
- 2019 August 14th:
    - Add `GET /activity` and `GET /activity/histogram` Activity API.
- 2019 July 10th:
    - Add `GET /event/histogram` Event statistics API.
- 2018 May 7th:
    - Add `GET /extracted_event` Search API.
- 2018 Marth 13th:
    - Add `GET /event` Search API.

# <a id="activity">Activity APIs</a>

## <a id="get_search_activity"></a> Search activity

Search activity.

    GET /activity?
        query={query}&
        type={eventType}&
        from={beginTime}&
        to={endTime}&
        id={id}&
        city={city}&
        category={category}&
        gps={gps}&
        radius={radius}&
        num={numberOfPage}&
        p={page}&
        sort={sort}&
        asc={asceding}&
        timeKey={timeField}

- *string* `query`: (**optional**) Search keyword.
- *string* `type`: (**optional**) Search specific event types in comma separated format such as `type=Web Post,FB Post`. You can specify **FB Post**, **Web Post**, **FB Event Post**.
- *number* `from`: (**optional**) The start time in milliseconds from 1970 Jan 1st UTC.
- *number* `to`: (**optional**) The end time in milliseconds from 1970 Jan 1st UTC.
- *string* `id`: (**optional**) Specified event id.
- *string* `city`: (**optional**) To display data of the specified cities in comma separated format such as `city=臺北,宜蘭`.
- *string* `category`: (**optional**) To display data of the specified categories in comma separated format such as `category=音樂,運動`. Supports wildcard matching using `*` symbol for pattern matching (e.g., `category=音樂*,運動` will match categories starting with "音樂" and exact match "運動").
- *string* `gps`: (**optional**) Target point gps. This filter returns all results within a circle of the given radius around the target point.
- *number* `radius`: (**present when gps parameter exists**) The radius of the search. (meters)
- *number* `num`: (**optional**) Number of events to list in each page. Default is **200**.
- *number* `p`: (**optional**) Page number. **0** to list all events. Positive number to list event by page. Default is **1**.
- *string* `sort`: (**optional**) To sort with the specified key. You can specify **\_score**, **start\_time**, **end\_time**, **updated\_time**, **hot_count**, **distance**, **interested\_count**, **num\_mood**, **num\_likes**, **num\_angry**, **num\_ha**, **num\_wow**, **num\_love**, **num\_sad**, **num\_comments**, **num\_shares**. Default is **start\_time**.
- *boolean* `asc`: (**optional**) To sort with ascending order. Default is **true**.
- *string* `timeKey`: (**optional**) The date field to filter on. Must be one of: `start_time`, `end_time`, `created_time`, `updated_time`. Default is `start_time`.


#### Response

- **200 OK**: Activity data. Parameters are:

    - *number* `count`: Total number of results matching our search criteria.
    - *number* `queryTime`: Time in seconds for Elasticsearch to execute the search.
    - *list* `events`: Activities.
        - *string* `id`: The event ID.
        - *string* `freetext_type`: The event type.
        - *string* `name`: The event name.
        - *string* `description`: (**optional**) The event description.
        - *string* `highlight_description`: (**optional**) The event highlight description.
        - *string* `location`: (**optional**) The event location.
        - *number* `start_time`: The event start time in milliseconds from 1970 Jan 1st UTC.
        - *number* `end_time`: (**optional**) The event end time in milliseconds from 1970 Jan 1st UTC.
        - *string* `category`: (**optional**) The event category.
        - *string[]* `category_list`: The event multi-label classification category result.
        - *object* `owner`: (**optional**) The event owner information.
          - *string* `id`: The event owner id.
          - *string* `name`: The event owner name.
          - *string* `category`: (**optional**) The event owner category.
      - *object* `venue`: (**optional**) The event venue information.
          - *string* `id`: The event venue id.
          - *string* `country`: (**optional**) The event venue country.
          - *string* `city`: (**optional**) The event venue city.
          - *number* `latitude`: The event venue latitude.
          - *number* `longitude`: The event venue longitude.
          - *string* `street`: (**optional**) The event venue street.
          - *string* `zip`: (**optional**) The event venue zip.
      - *string[]* `imgs`: (**optional**) The event photos links.
        - *number* `updated_time`: (**optional**) The event last update time in milliseconds from 1970 Jan 1st UTC.
        - *number* `created_time`: (**optional**) The time the post was initially published in milliseconds from 1970 Jan 1st UTC.
      - *number* `hot_count`: (**optional**) Number of hot in the event.
      - *number* `interested_count`: (**optional**) Number of people interested in the event.
      - *number* `maybe_count`: (**optional**) Number of people who maybe going to the event.
      - *number* `noreply_count`: (**optional**) Number of people who did not reply to the event.
      - *number* `attending_count`: (**optional**) Number of people attending the event.
      - *number* `num_mood`: (**optional**) Total number of mood.
      - *number* `num_likes`: (**optional**) Total number of people who liked.
      - *number* `num_angry`: (**optional**) Total number of people who angry.
      - *number* `num_ha`: (**optional**) Total number of people who ha.
      - *number* `num_wow`: (**optional**) Total number of people who wow.
      - *number* `num_love`: (**optional**) Total number of people who love.
      - *number* `num_sad`: (**optional**) Total number of people who sad.
      - *number* `num_comments`: (**optional**) Total number of comments.
      - *number* `num_shares`: (**optional**) Total number of people who shares.
      - *number* `distance`: (**optional**) Distance between target point and activity position. (meters)

    - **Example**

            {
              "count": 2,
              "queryTime": 0.013,
              "events": [
                  {
                    "id": "FBEvent_2012178632332403",
                    "freetext_type": "FB Event Post",
                    "name": "人工智慧技術的應用",
                    "location": "NCTU 交大創業與創新學程 / 創業育成中心",
                    "start_time": 1520301600000,
                    "end_time": 1520308800000,
	                "description": "主題：【AI人工智慧技術應用】\n\n主講人：吳毅成教授(交大資訊工程系教授)\n\n時間：107/03/06 Tue 10:00-12:00\n\n地點：交大光復校區管理一館光寶二廳\n\n報名網址：https://pis.ee/5AKJX\n\n歡迎畢業校友、非交大生參加",
                    "updated_time": 1520471480846,
                    "category_list": [
                      ""
                    ],
                    "owner": {
                      "id": "501364163226187",
                      "name": "NCTU 交大創業與創新學程 / 創業育成中心"
                    },
                    "venue": {
                      "id": "501364163226187",
                      "country": "Taiwan",
                      "city": "新竹",
                      "latitude": 24.787099807854,
                      "longitude": 120.99526405334,
                      "street": "新竹市大學路1001號",
                      "zip": "30010"
                    },
                    "imgs": [
                      "https://scontent.xx.fbcdn.net/v/t31.0-8/s720x720/18402115_2006693206026601_3199362888900575852_o.jpg?_nc_cat=0&oh=7e58424c19ddc572d1bd88f63df40396&oe=5B667CEF"
                    ],
                    "hot_count": 58,
                    "interested_count": 51,
                    "maybe_count": 51,
                    "noreply_count": 29,
                    "attending_count": 7,
                    "distance": 539
                  },
                  {
                    "id": "FB_558699390837369_2715943778446242",
                    "freeTextType": "FB Post",
                    "description": "【活動轉知】#2019桃園婦女節 #Women一起愛自己\n 一年一度的婦女節又來囉~~~\n 今年，依舊有好玩有趣的活動與民眾分享 🎡園遊會資訊🎡⋯⋯\n 活動時間：108/03/09（六）11:00~14:00\n 活動地點：陽明運動公園（桃園市桃園區長沙路）\n 當天，有吃有玩還有抽獎🥳\n 我們 #桃園市婦女發展中心 也會去擺攤\n 記得來找我們玩遊戲拿小禮哦🥰 ----------------------------------------------------------------\n 💄名人講座💄\n 講座時間：108/03/16（六）09:30~12:00\n 講座地點：中壢藝術館二樓演藝廳\n 邀請到 #柳燕老師 及 #林書煒女士\n 分享保養技巧及工作歷程 歡迎大家空下時間來參與活動呦✌️ \n",
                    "start_time": 1552089600000,
                    "location": "陽明運動公園",
                    "name": "桃園婦女節",
                    "gps": {
                      "lat": 24.98084099977,
                      "lon": 121.30879014665
                    },
                    "owner": {
                      "name": "桃園市桃園地政事務所",
                      "id": "558699390837369"
                    },
                    "venue": {
                      "latitude": 24.98084099977,
                      "longitude": 121.30879014665
                    },
                    "updated_time": 1551920020815,
                    "created_time": 1551145599000,
                    "hot_count": 3,
                    "num_likes": 0,
                    "num_comments": 0,
                    "num_shares": 3,
                    "num_mood": 0,
                    "num_angry": 0,
                    "num_ha": 0,
                    "num_wow": 0,
                    "num_love": 0,
                    "num_sad": 0
                  }
                  ...
              ]
            }

## <a id="get_search_activity_histogram"></a> Get activity histogram

Get activity histogram.

    GET /activity/histogram?
        group={groupField}&
        type={eventType}&
        query={query}&
        from={beginTime}&
        to={endTime}&
        id={id}&
        city={city}&
        category={category}&
        sort={sortKey}&
        asc={ascending}&
        num={numberOfAggregations}&
        timeKey={timeField}

- *string* `group`: (**required**) Specified group field.  Available expressions are **category**,  **city**.
- *string* `query`: (**optional**) Search keyword.
- *string* `type`: (**optional**) Search specific event types in comma separated format such as `type=Web Post,FB Post`. You can specify **FB Post**, **Web Post**, **FB Event Post**.
- *number* `from`: (**optional**) The start time in milliseconds from 1970 Jan 1st UTC.
- *number* `to`: (**optional**) The end time in milliseconds from 1970 Jan 1st UTC.
- *string* `id`: (**optional**) Specified event id.
- *string* `city`: (**optional**) To display data of the specified cities in comma separated format such as `city=臺北,宜蘭`.
- *string* `category`: (**optional**) To display data of the specified categories in comma separated format such as `category=音樂,運動`.
- *string* `sort`: (**optional**) To sort with the specified key. You can specify **value**, **key**. Default is **value**.
- *boolean* `asc`: (**optional**) To sort with ascending order. Default is **false**.
- *number* `num`: (**optional**) Maximum number of aggregations object to return. Default is **100**.
- *string* `timeKey`: (**optional**) The date field to filter on. Must be one of: `start_time`, `end_time`, `created_time`, `updated_time`. Default is `start_time**.

#### Response

- **200 OK**: Activity histogram statistics. Parameters are:

    - *string* `key`: The axis display string.
    - *number* `value`: Quantity that matches the key.

    - **Example**

            [
                {
                    "key": "適合兒童參與",
                    "value": 42145
                },
                {
                    "key": "藝術",
                    "value": 34999
                },
                {
                    "key": "人際交流",
                    "value": 16267
                },
                {
                    "key": "手工藝",
                    "value": 15414
                },
                {
                    "key": "美食",
                    "value": 10978
                },
                ...
            ]

## <a id="get_search_activity_date_histogram"></a> Get activity date histogram

Get activity data aggregated by time intervals.

    GET /activity/date-histogram?
        interval={timeInterval}&
        group={dateField}&
        timezone={timezone}&
        query={query}&
        from={beginTime}&
        to={endTime}&
        timeKey={timeField}&
        id={id}&
        city={city}&
        category={category}&
        type={eventType}&
        num={numberOfBuckets}

- *string* `interval`: (**required**) Time interval for aggregation. Must be one of: `1m`, `5m`, `15m`, `30m`, `1h`, `2h`, `4h`, `12h`, `1d`, `1w`, `1M`.
- *string* `group`: (**required**) The date field to aggregate on. Must be one of: `start_time`, `end_time`, `created_time`, `updated_time`.
- *string* `timezone`: (**optional**) Timezone for the aggregation. Default is `Asia/Taipei`.
- *string* `query`: (**optional**) Search keyword.
- *number* `from`: (**optional**) The start time in milliseconds from 1970 Jan 1st UTC.
- *number* `to`: (**optional**) The end time in milliseconds from 1970 Jan 1st UTC.
- *string* `timeKey`: (**optional**) The date field to filter on. Must be one of: `start_time`, `end_time`, `created_time`, `updated_time`. Default is same as `group`.
- *string* `id`: (**optional**) Specified event id.
- *string* `city`: (**optional**) To display data of the specified cities in comma separated format such as `city=臺北,宜蘭`.
- *string* `category`: (**optional**) To display data of the specified categories in comma separated format such as `category=音樂,運動`.
- *string* `type`: (**optional**) Search specific event types in comma separated format such as `type=Web Post,FB Post`. You can specify **FB Post**, **Web Post**, **FB Event Post**.
- *number* `num`: (**optional**) Maximum number of buckets to return. Default is **100**.

#### Response

- **200 OK**: Activity date histogram statistics. Parameters are:

    - *number* `key`: The timestamp in milliseconds.
    - *string* `key_as_string`: The timestamp in ISO 8601 format.
    - *number* `value`: Number of events in the time bucket.

    - **Example**

            [
                {
                    "key": 1747152000000,
                    "key_as_string": "2025-05-13T16:00:00.000Z",
                    "value": 10
                },
                {
                    "key": 1747238400000,
                    "key_as_string": "2025-05-14T16:00:00.000Z",
                    "value": 10
                }
            ]

#### Notes

- The `interval` parameter supports the following values:
  - Minutes: `1m`, `5m`, `15m`, `30m`
  - Hours: `1h`, `2h`, `4h`, `12h`
  - Days: `1d`
  - Weeks: `1w`
  - Months: `1M`
- The `group` parameter allows you to aggregate data based on different date fields:
  - `start_time`: Aggregate by event start time
  - `end_time`: Aggregate by event end time
  - `created_time`: Aggregate by event creation time (default)
  - `updated_time`: Aggregate by event last update time
- The `timezone` parameter should be a valid IANA timezone name (e.g., `Asia/Taipei`, `UTC`, etc.)
- The response includes both millisecond timestamps and ISO 8601 formatted date strings
- The `value` field represents the number of events in each time bucket

# <a id="FB_Event_Post">FB Event Post APIs</a>

## <a id="get_search_event_post"></a> Search <a id="event">FB Event Post</a>

Search FB Event Post.

    GET /event?
        query={query}&
        from={beginTime}&
        to={endTime}&
        id={id}&
        city={city}&
        category={category}&
        gps={gps}&
        radius={radius}&
        num={numberOfPage}&
        p={page}&
        sort={sort}&
        asc={asceding}

- *string* `query`: (**optional**) Search keyword.
- *number* `from`: (**optional**) The start time in milliseconds from 1970 Jan 1st UTC.
- *number* `to`: (**optional**) The end time in milliseconds from 1970 Jan 1st UTC.
- *string* `id`: (**optional**) Specified event id.
- *string* `city`: (**optional**) To display data of the specified cities in comma separated format such as `city=臺北,宜蘭`.
- *string* `category`: (**optional**) To display data of the specified categories in comma separated format such as `category=音樂,運動`.
- *string* `gps`: (**optional**) Target point gps. This filter returns all results within a circle of the given radius around the target point.
- *number* `radius`: (**present when gps parameter exists**) The radius of the search. (meters)
- *number* `num`: (**optional**) Number of events to list in each page. Default is **200**.
- *number* `p`: (**optional**) Page number. **0** to list all events. Positive number to list event by page. Default is **1**.
- *string* `sort`: (**optional**) To sort with the specified key. You can specify **\_score**, **start\_time**, **end\_time**, **updated\_time**, **distance**, **interested\_count**. Default is **start\_time**.
- *boolean* `asc`: (**optional**) To sort with ascending order. Default is **true**.


#### Response

- **200 OK**: FB Event Post data. Parameters are:

    - *number* `count`: Total number of results matching our search criteria.
    - *number* `queryTime`: Time in seconds for Elasticsearch to execute the search.
    - *list* `events`: FB Event Posts.
        - *string* `id`: The event ID.
        - *string* `name`: The event name.
        - *string* `description`: (**optional**) The event description.
        - *string* `location`: (**optional**) The event location.
        - *number* `start_time`: The event start time in milliseconds from 1970 Jan 1st UTC.
        - *number* `end_time`: (**optional**) The event end time in milliseconds from 1970 Jan 1st UTC.
        - *string* `category`: (**optional**) The event category.
        - *object* `owner`: (**optional**) The event owner information.
          - *string* `id`: The event owner id.
          - *string* `name`: The event owner name.
          - *string* `category`: (**optional**) The event owner category.
      - *object* `venue`: (**optional**) The event venue information.
          - *string* `id`: The event venue id.
          - *string* `country`: (**optional**) The event venue country.
          - *string* `city`: (**optional**) The event venue city.
          - *number* `latitude`: The event venue latitude.
          - *number* `longitude`: The event venue longitude.
          - *string* `street`: (**optional**) The event venue street.
          - *string* `zip`: (**optional**) The event venue zip.
      - *string[]* `imgs`: (**optional**) The event photos links.
      - *number* `interested_count`: (**optional**) Number of people interested in the event.
      - *number* `maybe_count`: (**optional**) Number of people who maybe going to the event.
      - *number* `noreply_count`: (**optional**) Number of people who did not reply to the event.
      - *number* `attending_count`: (**optional**) Number of people attending the event.
      - *number* `distance`: (**optional**) Distance between target point and activity position. (meters)

    - **Example**

            {
              "count": 483305,
              "queryTime": 0.033,
              "events": [
                  {
                    "id": "FBEvent_2012178632332403",
                    "name": "人工智慧技術的應用",
                    "location": "NCTU 交大創業與創新學程 / 創業育成中心",
                    "start_time": 1520301600000,
                    "end_time": 1520308800000,
                    "description": "主題：【AI人工智慧技術應用】\n\n主講人：吳毅成教授(交大資訊工程系教授)\n\n時間：107/03/06 Tue 10:00-12:00\n\n地點：交大光復校區管理一館光寶二廳\n\n報名網址：https://pis.ee/5AKJX\n\n歡迎畢業校友、非交大生參加",
                    "owner": {
                      "id": "501364163226187",
                      "name": "NCTU 交大創業與創新學程 / 創業育成中心"
                    },
                    "venue": {
                      "id": "501364163226187",
                      "country": "Taiwan",
                      "city": "新竹",
                      "latitude": 24.787099807854,
                      "longitude": 120.99526405334,
                      "street": "新竹市大學路1001號",
                      "zip": "30010"
                    },
                    "imgs": [
                      "https://scontent.xx.fbcdn.net/v/t31.0-8/s720x720/18402115_2006693206026601_3199362888900575852_o.jpg?_nc_cat=0&oh=7e58424c19ddc572d1bd88f63df40396&oe=5B667CEF"
                    ],
                    "interested_count": 51,
                    "maybe_count": 51,
                    "noreply_count": 29,
                    "attending_count": 7,
                    "distance": 539
                  },
                  ...
              ]
            }

## <a id="get_search_event_post_histogram"></a> Get <a id="event">FB Event Post</a> histogram

Get FB Event Post histogram.

    GET /event/histogram?
        group={groupField}&
        query={query}&
        from={beginTime}&
        to={endTime}&
        id={id}&
        city={city}&
        category={category}&
        sort={sortKey}&
        asc={ascending}&
        num={numberOfAggregations}

- *string* `group`: (**required**) Specified group field.  Available expressions are **category**,  **city**.
- *string* `query`: (**optional**) Search keyword.
- *number* `from`: (**optional**) The start time in milliseconds from 1970 Jan 1st UTC.
- *number* `to`: (**optional**) The end time in milliseconds from 1970 Jan 1st UTC.
- *string* `id`: (**optional**) Specified event id.
- *string* `city`: (**optional**) To display data of the specified cities in comma separated format such as `city=臺北,宜蘭`.
- *string* `category`: (**optional**) To display data of the specified categories in comma separated format such as `category=音樂,運動`.
- *string* `sort`: (**optional**) To sort with the specified key. You can specify **value**, **key**. Default is **value**.
- *boolean* `asc`: (**optional**) To sort with ascending order. Default is **false**.
- *number* `num`: (**optional**) Maximum number of aggregations object to return. Default is **20**.

#### Response

- **200 OK**: FB Event Post histogram statistics. Parameters are:

    - *string* `key`: The axis display string.
    - *number* `value`: Quantity that matches the key.

    - **Example**

            [
                {
                    "key": "適合兒童參與",
                    "value": 42145
                },
                {
                    "key": "藝術",
                    "value": 34999
                },
                {
                    "key": "人際交流",
                    "value": 16267
                },
                {
                    "key": "手工藝",
                    "value": 15414
                },
                {
                    "key": "美食",
                    "value": 10978
                },
                ...
            ]

# <a id="Extracted_Event_from_FB_Post">Extracted Event from FB Post APIs</a>

## <a id="get_search_extracted_event"></a> Search <a id="extracted_event">Extracted Event from FB Post</a>

Search extracted event from FB post.

    GET /extractedevent?
        query={query}&
        from={beginTime}&
        to={endTime}&
        id={id}&
        city={city}&
        gps={gps}&
        radius={radius}&
        num={numberOfPage}&
        p={page}&
        sort={sort}&
        asc={asceding}

- *string* `query`: (**optional**) Search keyword.
- *number* `from`: (**optional**) The start time in milliseconds from 1970 Jan 1st UTC.
- *number* `to`: (**optional**) The end time in milliseconds from 1970 Jan 1st UTC.
- *string* `id`: (**optional**) Specified event id.
- *string* `city`: (**optional**) To display data of the specified cities in comma separated format such as `city=臺北,宜蘭`.
- *string* `gps`: (**optional**) Target point gps. This filter returns all results within a circle of the given radius around the target point.
- *number* `radius`: (**present when gps parameter exists**) The radius of the search. (meters)
- *number* `num`: (**optional**) Number of events to list in each page. Default is **200**.
- *number* `p`: (**optional**) Page number. **0** to list all events. Positive number to list event by page. Default is **1**.
- *string* `sort`: (**optional**) To sort with the specified key. You can specify **\_score**, **start\_time**, **distance**, **num\_mood**, **num\_likes**, **num\_angry**, **num\_ha**, **num\_wow**, **num\_love**, **num\_sad**, **num\_comments**, **num\_shares**. Default is **start\_time**.
- *boolean* `asc`: (**optional**) To sort with ascending order. Default is **true**.
    - **Example**

            {
              "count": 1,
              "queryTime": 0.001,
              "events": [
                {
                  "id": "FB_558699390837369_2715943778446242",
                  "freeTextType": "FB Post",
                  "description": "【活動轉知】#2019桃園婦女節 #Women一起愛自己\n 一年一度的婦女節又來囉~~~\n 今年，依舊有好玩有趣的活動與民眾分享 🎡園遊會資訊🎡⋯⋯\n 活動時間：108/03/09（六）11:00~14:00\n 活動地點：陽明運動公園（桃園市桃園區長沙路）\n 當天，有吃有玩還有抽獎🥳\n 我們 #桃園市婦女發展中心 也會去擺攤\n 記得來找我們玩遊戲拿小禮哦🥰 ----------------------------------------------------------------\n 💄名人講座💄\n 講座時間：108/03/16（六）09:30~12:00\n 講座地點：中壢藝術館二樓演藝廳\n 邀請到 #柳燕老師 及 #林書煒女士\n 分享保養技巧及工作歷程 歡迎大家空下時間來參與活動呦✌️ \n",
                  "start_time": 1552089600000,
                  "location": "陽明運動公園",
                  "name": "桃園婦女節",
                  "gps": {
                    "lat": 24.98084099977,
                    "lon": 121.30879014665
                  },
                  "owner": {
                    "author": "taoyuanland",
                    "author_name": "桃園市桃園地政事務所",
                    "id": "558699390837369"
                  },
                  "venue": {
                    "latitude": 24.98084099977,
                    "longitude": 121.30879014665
                  },
                  "recordUpdateTime": 1551920020815,
                  "created_time": 1551145599000,
                  "num_likes": 0,
                  "num_comments": 0,
                  "num_shares": 3,
                  "num_mood": 0,
                  "num_angry": 0,
                  "num_ha": 0,
                  "num_wow": 0,
                  "num_love": 0,
                  "num_sad": 0
                }
              ]
            }


