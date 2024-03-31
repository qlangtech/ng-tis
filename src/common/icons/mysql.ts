// import {IconDefinition} from '@ant-design/icons-angular';
//
//
// const mysql_icon = '<svg viewBox="0 0 128 128" focusable="false">  <image id="image0" x="0" y="0"\n' +
//     '    xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAIGNIUk0AAHomAACAhAAA+gAAAIDo\n' +
//     'AAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCa\n' +
//     'nBgAAAFoelRYdFJhdyBwcm9maWxlIHR5cGUgeG1wAAA4jYVTS3aDMAzc6xQ9gpFkCY5Dsb3re132\n' +
//     '+B0ZEj4pDX4BYkkzo7Ggn69v+ogrp4Fk8VFmH614smLZ1QZO8d8Wqy4Rk8Jsg6k1Y8syr/vP7MbM\n' +
//     'iXYYbH5GSR615MRJxZqjkJNkrqL4JWapaeYUCxIY4CZzZlVSu/CvwdAwumIlmcHZvF9cHUlcO4Vz\n' +
//     'k0GmWNxIkjA2GPeyguApPgEWsn3kEgQR3rVcFalaJhcTbEy9tQkuVCjcEuALgxtOhEIYcQI6Lh/p\n' +
//     '0FQA2V9tdU11txvv8M8KGt5qorWhm9hepT8beBDAVJxTQCyhctWfs1X0oyRVRJYd+//0ezJ6lGsX\n' +
//     '6+EPYADUAUAznGnu8uhdOxoHPVneTlHvCOgu8a1fyUYLoLZOOHUY0XVusvMm+szOFxcvIIFB70Cu\n' +
//     'Q8jtOIb7FNJryTE5viK1iPXdl887IvQLSqHuVwuJAbEAAAABb3JOVAHPoneaAAAoUUlEQVR42u19\n' +
//     'e3hV1Zn3711rX845CYFwUUEuShlHk9rWodPO9KKho71oW6ff9KSjQAIqRNupddoi2OlMFu1TIWBv\n' +
//     'dHpJUIEkqN/JfJ3pzdu0Eju917TTKnRqqSIqoAiB3M7Ze6+13u+PvU8SICAXlbazf8/DA5yz9zpr\n' +
//     'r/e33vWu97I2kCJFihQpUqRIkSJFihQpUqRIkSJFihQpUqRIkSJFihQpUqRIkSJFij8d0OnuwB8T\n' +
//     'lFKiG5cI4GHUAVYpZU93n1K8QlBKibE+zxcKkpn/aCfSH23HX1EwE4i44XObzibt/hVbO+SQ/NWd\n' +
//     'y6/aVb5EqS2OUvP06e7qiSIlwIugLNiGtZsvhbXfqRg/0bPGYGjgIBPEv0Pgq+3L5n8XAPKq4AFA\n' +
//     '9dRenrb7PFbNdQZEfLqf4VhICXAM5AsF2VVfbwCgYU3no2A7jYGbieh8WPx95cQp03UYoDTU/w0p\n' +
//     '8IkNH1+wbfT9SimxFTVOLabYP1TtkBLgGCjP/ry6fWIu6+8B0ec33bxgOQBc+7nCRKOj97K1y8ZN\n' +
//     'PrOm74U9+5hxAxF+yhFk1s3sb1tRf7DcVr5QkLXbtvEfmuGYEuAYyOcLsqsr1gCNazp/BsaUoUe8\n' +
//     'OeXPAGCR2pCxGdmcqaxaQUKiNNAHgA0YLzDzI0LK72ptvt15y8LtAFCnlNPd3PwHszSkBHgR5FXB\n' +
//     '61L1YcPqTVfmJkz+j6ED+29tX7HwnxapDZkdOEd3J6q9oaXz/WD7dhI0ERDj2ZqZjp89z89WYPDg\n' +
//     'Pgboqxkpmts+fvULAFCntjjdfwDLQkqAFwMzqZUrSSllG1ra23JVE5cMHux7b8eKq7+VVwWvFtu0\n' +
//     'am7msWZ0w6pNF5GQDQxeNG7iGRP69+/dLwR9aOOy+fcAI+Q6nY8nTr2JP3EQ8daaGgKA9uUNTUP9\n' +
//     'vY8R2X/7+5Y7pnWp+nDXrqkSRLy0tdU95D5mar+l8Zebli/4R+k4rxnYv/ezQtDEbFX13Y0tHZ2L\n' +
//     'by1M6VL1YbJzOG0TMdUAx4mlS1vdtramqPHTG19FWW+7Nebe9uULrwBA+UJBdNXXm4Wq/QxkcNGE\n' +
//     '3OTuL914eZBXBa96ai+3NTVFAHBNy92v19BfrJp81pv6X3huB8hdsOnmD/wwXyjIrnzeng67INUA\n' +
//     'x4m2tqZoaWuru+mfF/0ext6QyY27vGHVpksBcMXgoAsA7JIkEu19xX3fAkBdqj5sa2rSS1tb3Tql\n' +
//     'nDuXX/XIzuLvL+nb99zqTGXVOUD0g8bVHQ3lrSZOg0cxJcAJYNru3QYAvAmDd5SGBnpB4oMAsHHx\n' +
//     'ouDD6+71O/9p4W5ivsbLVV42v2XDGwEgny+ItqamqLu52eRVwetWSrffvOCWYKC/gUjAzVVsaljT\n' +
//     '8REQMePoLueXCykBTgBKKQYzxSrdPgiiKxpu3TQJIN6zf4AB4NzS7+/TQXE5aecpAOgq5ON9PxF3\n' +
//     'qfowXyjIfKEgNy6f3wHC26PSYJDJVX1hUUvnTZTYG3/MsYU/edQp5QDAopaOv136r9/gxlUdfwfE\n' +
//     'jh4cYVMdVZBUNhobWjbPa2jpiK5b93VubOlYDADJd68ICVINcJIYLPrfLQ329bNAPQAU8nkLgAFA\n' +
//     'KRax8I9q1HFbU1OUVwWvffn8LVKI91sdASTubLxt88VtTU3R0qWtzul+xhRjgZny+YIEgIbV7Xc0\n' +
//     'rO4IFqkNE+KvTlx1lzXBwpbOm67/6re5oaVjx8K17WcAsSfy5X6cVAOcKIgYtYgFQ9zqZXOezTmN\n' +
//     'AFC/sss90ebKhmXH8gVfGOo/0Dlu0pmzyIp1ANDVVf+yxw1SApwEarFNK6VE+/LGn4WloXuJcWv+\n' +
//     'y4XKspF3Im0ppWxZCwhEy/r3Pb8jO67qAwtbNi8EcKSD6SVGSoCTgFLK7po6VQIAgz/ueJlcbjDs\n' +
//     'AoCu+npzolu5tqam6MPr1vkbb168h0CfNFEEAV67cG37GW1NTdGJkupEkBLgJNHW1BTVKeV0LG/4\n' +
//     'TVQKrvVzle9sWN2+Kv72khMe10n790cAsGn5/M1hcejB3PiJZ5KljwJAde/sl01OKQFOAd3NzQYA\n' +
//     '2m9ZsKE02L+PQLUAsLVmL5+oV08pZcsZRUJiVVAcADPmN9y6aVJb0+sjpba8LLuClACngLqV3RIA\n' +
//     'Fq9qn+dlKyYx45vJV/Jk/PpxZJBp47KF3SYMfpKtrJpOUrwXALZi78siq5QAp4ApiVAs4ZKwNGTY\n' +
//     '4W8CQO22KSdtvSsVk8oy3SldD8y8UCklTsbAPB6kBDh5UC22aQBgId5BwPc6ljU8ny8U5Knk/6nm\n' +
//     'OgMAJQwWBntf2O34mXlPZufMA4DabVNecu9gSoCTRL5QEEopO39dZxUxv5rZ/AAAsA2nNkuJWCkW\n' +
//     'XSuaDgrQulzVRFjwYgBQap5+qeMEKQFOEtW9vQIAvBDTScgKZvrdIRecgqC2bu0iALDadPS9sLtX\n' +
//     'Cjl/0erOCwGgvr7rJZVZSoCTRO/uagKASIcTSAhIQQcAoBZTbLmQJL7yxInQVchbpZRo/2Tjs2Bu\n' +
//     'rZw4BYb4HwCgtnbbS5o0khLgJDGwb08sWOtKADCWGQB2YIcDIl7wuY45jS0dnUuXtjnACcb5ibjs\n' +
//     'aCI4nX179xQF0dLG1RtrlVL2pcwZSAlwkqicdBYDgCQxBABkeRwADKLCAoCIxBe9XOX88FUVcwFg\n' +
//     'K2pOaB8/bfduA2batOLqrQx0VUyYDCZ5EwDsmDXLe6meIyXASaIW8VaPyd1rjYYFnwPEe/lFazvq\n' +
//     'CHw5GwMGXwcAe7HNnshyoJSy+SS4RJDrBw+8AACNC1Z1zNm4eHFp0YYNmXJuwqkgJcBJ42ELAO0r\n' +
//     '8k+DsUs6zhvK3zDT3wjHQVAcBID3L1jVMadbKZ1XJxYt7GrOR/l8QbavuPoHYL4nN36iKwhfWLj2\n' +
//     '62dsXLy41K2UVkqJUwkbpwQ4ScRr8RYnTvrg7zPzZUtVaw4AjDG1jpcBGKsZFAmB5QCAGpgT2h0Q\n' +
//     '8d7aeO8fRWJF8WDv7ooJk64QdnBnY8vm2xs+e/dFSinb1VVvYv/DidsGKQFOAbt2PU5AXAKQHTdh\n' +
//     'QpDJvRsABImZACCE20mEL3mZ3HXXrLpzdld9vSm7j48X3WqezhcK8q5Pzn/KWL642Nf7Rct41svm\n' +
//     'rvVc/xeNazofWLS688IkCmlPNHycJh++RGhs6fw1g6stcKkACtL1XmNA052ov8/KXJ815uvtyxf8\n' +
//     'nVJKnEyBqFIslCIb/3uL82TlrjfB8FUAL3YzOT8sDan25QtXAsC71q3z77vxxuB42k0JcIool5Av\n' +
//     'WrP5dcz8SxDgeBnooLRjaM/zNV2f/2hxYcvmhbnKce3F/t7L21c03re0tdUtF4ucCJRisWtqmxx9\n' +
//     '79Lb7ppcMvbW3PjqJcW+3h629v+0r2jYmfyGRpKneDSkBHgJUCbBgjUdbxWMLwLICZI3bbz56vuX\n' +
//     'tj7itjW9PmpY3b6KSF5LxXDmRrW4NLry+ERRPndgdNXRojUd72TQvxGJCoZ596ZlC7/DzEQEHCM5\n' +
//     'NcVLhdGWeDmuD8TCKhtni1o2f7ZxzebO0d+dym8qpcQitSFT/r2rV22ubmzp+Pcl677OjWs2f3z4\n' +
//     'wrTO4JXB6HDtaOGO/ndDS8c/NKxuv3rkrpMUzjGE2rhq41WL1m7mRS2dNwFxKTqOou1TZrzEKAv7\n' +
//     'cENvtPHXeOvGN7OkqH15489O9jfKbV3z+c2zTWj/GkSvYWNrQDSZwf1E4jLX86Gj4C2bbl7ww3Jx\n' +
//     '6+FtpQR4JVGetUS8YPUdr6XI7ev454YnEcvhuNbpOqWcbqX0wrX3vFqw/hSzvSRTOX6il8mhf99z\n' +
//     'YOBJgPYx218Q6EfSkQ9t+NhVT8f2wJG2QFp98koiFgABQOeKa381ylY4biNtCmriLCSts67vvU84\n' +
//     'Dop9B+8v9h1cK6V8+tyh3/3+cO1zNOEDqQY4XSiP+0lZ5+XDqxrXdK7MVIz7l2L/wf9hics7ljU8\n' +
//     'CSQGaR5xckoNzHD5+RhIPYGnBxz/OVnrPI5DbLp5QXMw2P9/KyZMOp8sbV+0pnPFIrUh09VVb6p7\n' +
//     'e0VXcz46lvBT/BFj9M6icU3nykW33c0fbL2PG1s6f92w9q6/Bo7vGNv/tUsAKwjUJM+/DQwFppNU\n' +
//     'yaPb7AZE3chHlhRetvq+0e7h5CTTlblxE95kjEZYGrpu07L5d7zY8TNHJwAzqZUgYOWoD5vR3Aym\n' +
//     'E8x5P5rD45U+NJEVRM/UuXJuU48eS9i8BU73w8A8hePO6mUFgalzJZb2aKIx2gQIrXMd7O4xx0MG\n' +
//     'Voctyy9CzHhsLxFKzdNLWx9xSwf+50owfzw3YeIbS/0HVmxcNr9FqS1Oc3OdORG5HVsznJhn6bRr\n' +
//     'GQaIC4dm6/K6OVV857QZfOe0Gdw6e/wR96hj20fMY7T55SmVxa+ecw63nX0ebzjnHF43p2r094UC\n' +
//     'JPOJj8fx3DPa+wgAjWs6rlq0dvMLi1o6rwfKTqoj5XbEB2Unw4I1HW+VJG4BqJ9G9q85MH9l483z\n' +
//     '7y3vR4/VqbKKWrz27huZ+V3Mto+ICEQZJtq+6WNXfQzxrDnuffAJD56CQDOYCMwds6bqIi8i8DsM\n' +
//     '41UCyAJgwyg6knYy+OeOsN+ka5/dUh74MWd1AZLqYQCAN00/20byKmZ+h7F8ngDGkSDBzGwZA0Jg\n' +
//     'Oxjfcxy6i67Z+cTh94/+f9+/nj0p54sWEE0GIxASvmHc5l678we8BQ7NO7Zmio+jnULluoQFn+mY\n' +
//     '6rjyKwwUNt189d1jbQfHYHlz8gW9uXLC5HcJIeql5+VJynxufPUVzNwEAOVslKMLXwmlyC5VrTlj\n' +
//     'zQq/ovKd0vPqpevlvWzFe2wULcm3FKqSa18WLcEMgoqFH7bNuMaU7GNOjm6VDl1CwHQpaZLj0GTf\n' +
//     'oxnSwZsdV9wUGfFQtH7Gw1HbzEuJwIfPPlZwysKL2mYu14HYKnyslQKXSsJMIaiagPHMmADGdMeh\n' +
//     'OicnPm0MP2rWz/hnAKB6mEO0R+9cAQCOj6y1uEpWiCulg3rKiSsdgXMBAHtrX3THFucEzIuzhFTB\n' +
//     '6/ynhbt3DD2et8aMW7q6MJ5G+SGOSoDm5oTxTFNKg/3QQWkoLA4ZHZRKg737AOY3Xn3b5lnx1Uev\n' +
//     'gi0nQRZz2Toimjp4sFeHpaIOS0NRsa8XRGDfC6YAQPkgxpccK0EEcNQ6c4VbIe6QRBODATukNcPN\n' +
//     'CVhmaIMg0mxg46FxJcE5w72YCAuPIJSCIAXNBUi9fmaXM06sBnh8MGCLEIDMCCBZsF1fwMsJBAHb\n' +
//     '0oAtESgnKuWnovUzCgCI6mEOX2ZYCMvAft1vUCpxYPstYHFccf3RUErZLlUfxsfRKt1xy8K2x0tT\n' +
//     'Bss/M/rawz2Bo1SEOVsIAYAcEEkQhLXGupnsmTaMLgbQ0Y2Hj9qJ6qm9DACC8R7H92FNJACKH1gI\n' +
//     'EIlxUuNMANuTIouXdL9aVqultpmXOh6tCvstGCj5PuV0iIN6yK4D4YeOpD5trW8MzmLNNSBchuej\n' +
//     '81mLLwAAujDct7IRFx2YucmtEu8PDpgSANevEFkd2J9whHusxRO+JBOVzFQhxTtcSXkhkAkiDnHQ\n' +
//     'kD9e5qP1M3e7S3Z+BDUgHjUjcwBCwHEkwVh2hASM5ZP21XQn2qC5uZmJaMzl4zACjGgItphmrQXK\n' +
//     'ayCDAA6FdHyB4HIAHd1K6UOLIGLUKeW0NTVFH/xyoXJwIHib1RFGx6SZmYXrkAn1GcBIkcUhRgoD\n' +
//     'iIPZL2YbEJhHrIhyX/KxsATwCRDAjKLvUVZH/AILeqe35OmeMYmzbs5nUGHOwaQntwMA6uN2uHWu\n' +
//     'S009kW6buUTmaH5wwIRgeH5WCBvaz7hLnv7kGM3doW+fdYU23Om7NCGIOAgOGngO3Ritn/UNqn/q\n' +
//     'IW6d6+K8caOfsTzeL4lNlNQRAEexsw4lQCL/hWsfqBB272RrTDKGnHxDQgclADTv71vunnbP8qt2\n' +
//     'qZUrSR3WcHbiRAlAD/SHbyVB52kdlTtgAQgCrBBSagqnHSbLuK6+TIfECjsmuFyAM+qjAiQRDN85\n' +
//     'c3ak+Q1RiQGCA4/AJXzaW7Kzh1vnHpo7d944xt5upvrtAYDfJk0SARxrk56IvzKzWoObUQIAGH+c\n' +
//     '8MyQvdNZGgv/iDareyzVP/UdvX7mEmZ0EeAzUCKPMgjsTQAeoqaeiNfN8YHj33qeJMYklHP4FQTA\n' +
//     'd/dVhgFPMjqEdFzXaP1jEKZI6cwxOoy8bOWZVBq6GMA9W7cetn4zU2VXlwYAIr7c8TKIggAM+99g\n' +
//     'JtfPXhQFQxpEUpCYCowsF0huQkKX4zIMxtzb5iXQZXSIcx2HKsKILQm4umgBoh+OCOfQZYcBKjuI\n' +
//     'qB6mvP/evmeOA2w3kYMGNyPODgZt4LuU1UN2vw6dT8Wkq/WovueQk795S53D3E1EO/8tapv5HS8r\n' +
//     'rgiKFjZggPG24PYZr/ave/ox6NJpc8kfQoCVK1cSANYhV4F5AjNrN1vpWN3XAyHZzWQ/rPvDUAjh\n' +
//     'RkTvBXBPoZC3oydp3cqVskspPV91VjH4b6wxkFLCWHRZa2odz78oKg3FAy/oLACYdt55DACNazo/\n' +
//     'RCQutLB9xKIahB9tWnb1hiN6PWrZWbxm8w0WeB2APiIaZ4T8JtV/4F4AIGE9osQwY1jHI6EDTAQA\n' +
//     'TMFYe2KGOnSmsIKgG7cH8ff8Pti4bhMZAg/yt7L/8ORT8U5h65Gx9nndOp7d2wMLuhuWrwDgR4Yj\n' +
//     'PycqbMm+BcBjqHZOW8rWYcyLt4BW68kkpAewIUFgpgOW+VtsLQjkRkEJAP5m6W13TSaiQ45DOW/X\n' +
//     'VAIAN8tvJKILjI5gtNZM9ttSOP2jhAgYewYA7Hu0mNTB8Z9VTpzSJIWzLDe++jpYu2q+6qwaFnqC\n' +
//     'fFdcIbtIqYxh+7GKCZOWSsf5eG58dROi6NzydVKGByLDIIIAoCEJEGiKhQPN6njC4bUOAJRunz6H\n' +
//     'gdfaiAHAhQYEoRsA0DbXGctfAADwx8c2hOYf64gPeJIIgIEAGHg9ACCcdNoCNocQYGtNXJYshDtZ\n' +
//     'Oi7AYGaGcBBUZ3u/H5WK+6XreiaKQtfzzyhGeh4AqHKuOzO1ti6ND00gvMvxMkhm4NaOZQ2PASix\n' +
//     'je0KZgtmOwUA9pw1oAFA23BD397dkQ6DcGDfcyUS4kxZQW8AgPwYZdE07s+ngDnTv/95RKViaaD3\n' +
//     'hWLE5kcJwwj6+W3EtMeVBABOMGTZcfF3Zv1MBQCkYhIc0+tXE//lWFzoCpoQGbZCwAkDjizzb150\n' +
//     'hHf3GADwb9i5gxlPkYPYwLOAtThv9DWnnQBlsMRkIUVMaWYAsvSlG28MGOh2/AxAiEgICEFXxsTZ\n' +
//     'Gx+RunIlERHn1Zcr2fI7TRRCui6I6IG4KdvHscVO1lowUXX+c4VsV329YWaaU3r6URA95vpZD0TW\n' +
//     '9TOAte8CAOSP7KcOomkgcRYACOlkAH4hk7FPAsBWtdKlJhwEcSdVCAAIAXAQMISLZr1+xj1D68+e\n' +
//     'TgqaFCwrOIe7dgEAvZl4GEjOgUsAoF2HQOD9WvCzLzrCCswKgghWED0FQQCBYBgkcCZ3zql6OQNG\n' +
//     'J0SAveUjSIyZlGzZmZlBggcAgGHvZWsBsBcFAZjxtoZbN03qqq83o7Nis9kJfymkc4HWEZsohIW9\n' +
//     'N2lsb3w/EVsLIUTleKGrAODGL93nKaUsge6VjgsGSEcRALy9TikniWsf6sUiO9vxfAnmULouiMVv\n' +
//     'Nv7j4gNgpprEqnYyodL99hf+OJFB/FlYKjFLX3zAtXKruX3WJ7l19nhS0LGHrtYre/+YQajusfGQ\n' +
//     '8IxktGy8H6IDWevHS9p5PUddwxNDMvF/4LnEHiFYgEDjhnqDytMl/CMIgMSxw+BJce8JzBZWIyaA\n' +
//     'pYejUrFXOK5rTRRJ150KKecBwMBb9ziqubk8EO+WrgcpJTHzb0B4BACIxQuWLQBIjv+uKBXNOADo\n' +
//     '3/9cEm/AfWFpCARkdVhiAK+emT33LwCgTm2RAFC7LTkkQTo1UjoAsxbSAYMfAYClbW0OKWW5AEkN\n' +
//     'zw06kbjCDPIP/ErheQ55xAiDIRtKgSqRxaeNiHr0+hmLmUFUvzVEOXhEGPYDOITq5NliejCXgFI0\n' +
//     'atiOjqlz4+x88MHh3Q0DTOwLR75kpd6nTIApNTWJE4Inx+EuEFsGYPoBoPOWhdtB+JHrZcAgLaQE\n' +
//     'M78HAN64/0IDIv7wunU+2FyugxIcLwMCPdCxrGEQAITkg2w0AAi2DLa2wpU4JGI2tPv5XzDbx9xM\n' +
//     'FgyUvEwOgHgHMHIqVzmMzNZeyGzBRGSNBhF+CgBIXDyJu9WhD+3YI/9s9jxb4uXG8gt+lfAFwQs1\n' +
//     'B0G/DaVDr5KeuFOvn/F9Xj/zMiLEW8TWuc5wKFYgU87jiSVIBp5nASSW4HGAE7fuSHxXZJzTm7N/\n' +
//     'CAHKM4uEHM+ceHKtATMNW+8MfpDZggBpoghEuOTazxUmliNQfUNVbyQpz7dWW6MjgHDfyL3Uby1r\n' +
//     'IiKALUi4huzEUV2grs9/tAjgQSnd2HMUE+YdQFx7Hx/FDlzTcsc4IlFjohBElNFh0C+i6JcAMG3a\n' +
//     '7mGjihQ0b6lzaF63ltftXOOwmWuG8FUiwK8UPgA3CLgUFK1xfPEWCDyo189s5QIkNfVEZQORwSP2\n' +
//     'QUwCsTsMBQDUHedg21H3J1I38OVpTdk6hADlmUWCqpgtEv8/SMiBUXc8FJVKA0JIz+jICCFnRUF4\n' +
//     'yYgInfdK6UI6rrBGbyc3Gs59ZxL9AAdEAgDZWINQNQA8N7Gf84WCSDp1f1gaAggZHQYA80ULW9ov\n' +
//     'AIB9E+9zAUAL51zLPEdHoXE9nwD61YZPXvP06OcY7tK8bs0FSFZwqGnXTmfJUx9k4A0msPf5PpHv\n' +
//     'UQaADYo2LEUMWSmW6oMz/4MVnLKBJkCH7/P9qRW5eBt5CY4LAhSrewIjdk8UEfAJB3teNgKUYZkn\n' +
//     'sLVgQDKzMczF8ncdyxoeI+AR6XkAcyRdDyD7bgCI1T+u0FEA6foA0fc2/uPiA+WSZeJwkK0NSRAA\n' +
//     'y0IISBITAKBy/1nDhpTH/s/Ymv9xXJ+YbeD4mRyRuBQAgv1PJ1tO+Xo/myMwB9LxQEQPA4dW5xxC\n' +
//     'gnoYqDgMywrCW/r0z53rnr7caP5bY3i7nxEuAEmADQ6a0KkU77bTZ3yqfL+2XARhxKPOPG6waLIA\n' +
//     'gMfnHluN746NRAbixBMGQxAs4yBs0I/TiNEEoPIAEqOSrQXF6RAREYdA/JrU5EH+k2JrhuI3XeCy\n' +
//     'OqWcA8GE15EU57O1MDqCYL4fAHoHqx0AMJEcIkIRJMBMHGuCmADVU2dzVz4+HattRf1BkHgo9kVQ\n' +
//     'vEiyfTsA9NZUxzOG+S1Jr6WOAgDYAgDoOvrDEsBUD0MKtkwEZ8nT35Ai9xcm4u/6WSET8Tp2wMJa\n' +
//     '3MBfnX52cu/+sjVgDWAZ1a7WU15sgHkkBgK2mJqEnRkSYMaz1LRraMzt5ytOgHJQ5Rl4zLaC2SJO\n' +
//     '3qHAWnGI+mPiB6OwGIGEr6PQOl5mxoyK2XNhcal0XUjHhdV6pxH8IwCo6BtkAHByugjQUNxuvNli\n' +
//     'tokR2BO/pDHJIyDwAzosAcRevB2kN1x72+ZZXfX1Jq++XAngTVFQhHQ83+joqcjSL4DjP0ZtmAj3\n' +
//     'zvHp2t/2y7D4viiwv/c9kgBsZJgdhyYYKf8KAKTELsQvhZGRYbiSKqSkc170hxQo9jPUOZb5XBgG\n' +
//     'AwIECEmJI6n29BNAxXEAVKEvy8wVsQYQACj0vZgA5+AcDQAdyxt6QPRrx/UAQBMIguV1BFxhohDS\n' +
//     'cUGE/+pY1vA8mMmbGsavWzsYhqCYAOA4FM7J6VrTdsfxgOHDl4z9obVmh3Q8YY3RUjpnGIOLAaAy\n' +
//     'U/UaAH9utAldPwMA3XfdMr8XAEZtRY8LdPn2gNfN8elDewcI+Aq84RA0QxK04bMBgBm/06EFCTgA\n' +
//     'QvIJTPxaAEB1j2WMHbvalriSMfXxOSRwrtYMAhxogCz9HAAwOHjagkFH/HApyuQAZEZCsRyxkREA\n' +
//     'NDfXmST5kJnpQSEdAJBhaQhsTSNb/KXRGtYYMNP9AJBf2eX2VldbAOhFtSZQKQn1JY5GHg+MHLGu\n' +
//     '1DyTLxRk+yca9zHT96XjAmAtHBcWdl7MOJrn+lkQMRkdQZD4DpCs/4dFB1lBvFiCJ/ZvT+LV/GQS\n' +
//     'lBVIIvKCOHZTR/QomPZ48cbQJBS5DBi2L8YkQM2sWLhWiktdX1QYi9B3yNGhfUESYrd1r37xreC2\n' +
//     'l5kA5bQsspwhIheATWLxYSB0HN7FSOiW2N4b5wbER6MzwwVYSMeBNfo5eGYLkuvL28tabNNEVByJ\n' +
//     '8TMAjAOArnzeJlqIz9qzJ2aWEN+21gAMAWaA6TVKKUHEb7NGQzqeq8NgpyHzMADs3bbt0Pw9jtVv\n' +
//     'vObXeqzgjJHjJzDrHA8AiGg2HICTvAUYhhX8JABkPrjzCRD/DA4BBCcYspCCLonWz3obAKBqus8F\n' +
//     'yLImYAbx56ZnafGOEhcgjRXXwnJMHp/AoAdoyVNPAsB2J3NUV7CUSUbQ1F4niVuM/Nky4r5OQtkO\n' +
//     't851WUEUEhsneUbnaBrqiGiYQ5S1gJMMHxisfRloIF4mVHOzRlMTMk8Uf1qanf2N43oXaB1aABIA\n' +
//     'C8eFCYMft3+08VmllFBNTVopJkBBKWUXrd1cOqwyLrakiRhJcuij+/fHKVg66Dbs7CFBZ1lrwMST\n' +
//     'd2TOuwJWv9bYCG4mC7b23vZlC55XSgnV3GwQZ7/EyRwE5g3nZGjxjlLi4QMDglvnjjz30h5NtKPE\n' +
//     'rbPHRxxdL8KYIa4kijSe9yV+Wk4MIUGdsPze5FkjcuAi5M/uvePPL6Zrf9sPxLUF/PhcQlePpY8+\n' +
//     'UwQAfWDGp12fXhcUbQhCNipaC7L/CgBbVa0358KtR/cFWBmHopt2DR3tknL/oKCHvWCjCE7HqHMY\n' +
//     'HohyHMASZUGQrGGSmRrlvIqRBoi4Tm1x2tS8qGF1x4PS9S/QUWABGs47t0z3AsBPJ050AQTAymH2\n' +
//     'MXMwnHYGBknKlL8rJ5d0K6XzhYLcUF+/t7Gl87+k5+aNjiBAGRZ2MQxXkxCIgiIDogAkSahEIwkZ\n' +
//     'iccuimyrXj9jPEOsc7LuI7Rgex/QMzLjmoDg9hmv1jb6quvRnKDEFoARFcK1A3YjXffMfm6d66Kp\n' +
//     'J3Ku29kVtc34iZ8VfxUUrQ6KbP2ceN2EsPhAuH7mh70lO3vi1O1YCLx5ZrUt8icE0ceDogUYwp8g\n' +
//     'EQ2Ydd6SZ38S+xm2hnEm0RgZagwY2HEAwJvOnrT/YPYQY3wiAMiDlj60d4BVrTc0qW9yzhOMSIc4\n' +
//     'Y0I/8ls1ESwXpme78ExYX39k3uUwAc7b9Th1AyCJTKL8bZJJofcGh944JYn+QYpvGx1+JJkRloQU\n' +
//     'Oiz1S3b/EwCKyUw+DCOOD2YQhF8+Ywd5DG/jkvfkGCbcTyTy1hgL0CSArwDAjutBR8EP25fPj7d/\n' +
//     'W0fl2bfOdYl6In37zPfIrGiAZkQle6UeCn8Tts74FQk8AUYRTFUAamC5zvGoIihazSCTqRKZaMD8\n' +
//     '2s2EsR+gqUcnTiHNRnxQl+zPfI+8IOQwGDLCz4q/1iH/ULfN/C/L/FsSKFnGtGgQb3J9MSuMha99\n' +
//     'nxw9aO5zi/4KAEDNMfL+CBxqhiB8Olo/46M6JKcqE5bd0gCzNaAKUPZRAFdi1qBwQnwwgH2rdJwV\n' +
//     'fLCvnu6YuZs/Z2+P+uiB94YzPwDsfCLRCMMTYEQVzh2WiSeSjXeSEKAHnD2HrFFd9fH7cB1b+qmx\n' +
//     '3hPS9WebKBhyPD9nguDHG2+5akdSYKIPeaS4wTBez5ljdzN7FdsGXRyWFdz73Sfi35TOD6KwGBCR\n' +
//     'zzycIWsBBhHWA7ED6ks31o8QK4ngsaEBM2SfkC5mu7F1fwFIXFB+0CTjD1EIBCUOHUmerJSOHrD/\n' +
//     'rcm+x2t4bnC4iCPJHaAbnvpl9LXp79Ea/8+vELlw0KJU4lAQfM/DpTJxWAEANCMo2giAdR3ytcbz\n' +
//     'msSH3CTDCNuSuoPuOCl0KBZIOR2UmWGFoOlCYvoRBLEEZAnRAIe/WzfHp8XbS0NfO/s7ksRU9/qn\n' +
//     'flz62vTFILxZZ8kVBuNJijGDTsNGYDkzV1iq9HPjIBw34+cqAaLMG/dfeNhMJlZKiTuXX9sPEg9V\n' +
//     'jJ8IEjLn5yrBoG8DQPm065HJXn4q63q5SgjHyXnZChBo0iAqHODQN2KUX5o4u//MJwj0uIy3nAaA\n' +
//     'cTxfmCh8dOjn/mZg5I1bw71Lcu7dpqe2SD94jdVYriNsi0JO/B3lRNL4b9cX8H3ymLDPDtrVzoB9\n' +
//     'U27Js8+MLgIBkrhCAdK9/pn7HdiLTNH+BxF0Jis8z08iPJbjP8yABPyscH2X/FBbzYxql/khs37m\n' +
//     'Cv7KzGpSsERg7I2DXGStEETjUCHge+T5WSFEeYqONuHKHkkikADmlGezEJqZTKJAnoSg5x2XLrJM\n' +
//     '3eSQP7aiSVA+tmzBqo45jiPfZ8FFAVQw252bli24Z9TpFmVJEoh48W2FGmbzHoYtChJSOnzX7Tdd\n' +
//     '/dxh6eLJ6BAvarnrMhDmWuIBAcoKIZ7r7xf3xIEedfghigSAG9d03ud4mXcGxUFNALmZnLRBeNXG\n' +
//     'FfPvOdaZe6PVHa+b4yMbXmwJbzGaz7egKWAWRNzvSHpKEP0cUjxAi3fsAY4s3xqNLQpOuYA0/NrZ\n' +
//     'r5WOc5mx/Dpr+WwpkAHIWsv9QtKvBfigAZrcrJgRDcaP5uYETNE+w0RfjrTtyN3wzLNAXFtovezV\n' +
//     'IK4CU4ijuOqHN6lEHlveLcfvvJvqYQZbZ00VzDXZ63d+L7x9+htgOWRHhlbbKdr4vxl3w++fHzYY\n' +
//     'x+DVMY8SGRNj1ASc1OdjoEyGfD4vc3OvfEy4zvlRGBQzucpsWCx+t33FgsuOr4sgtM11qKnnuA5m\n' +
//     '5C11Duq6zVFz/MrXFSCxDXx4Ns/haywAcMesqaZoP8HA9U5GOMGgLUqBrDPZgdlvFjpLdnaWbYzj\n' +
//     'HvvD+zPG7x5xzWHCBw7bBhLFqn1rTY2DbQBqgOrekcMIjwAR5wsFObBnj1O5/yxGDVC7bZtWRPZo\n' +
//     '19cp5WQnTpTl60faZ1q6tM2ZNi32CHbHd9jsX17ZKB3v/LBUDKXjZMPiYCAd8RFg5IDGYz10LMgk\n' +
//     'rFtTmzzXVjNc3MkgdNdJPPqMxP7thuZ1H5cQhu9vneuiukRA3OawximXhVeXiOq37gbwYb59eocJ\n' +
//     '7Kd8n96BrEC0zzzk7tp5DwCgGYYVCKrWLechHhd6M0xNPREpWGYQVkKWl6ryJd3bQHXNGJPUp710\n' +
//     'G7EUxtQMDbd1vh8G7WxNFmDrZytFWCxd237LgjvjureTeztXMlDxsyeVw6f+CEmbow6dGCZD61y3\n' +
//     'q7rHlrdh+vZZVxP4X0KND2Wv3/m9U539p4LTToDhY1ZXdcwRhHoAgyBbRRBvBegya40Fs/Arq6CL\n' +
//     'xZUbl89XidOHT+bljKcLzKCetrnO65OliBUcHGVWvpI47cfElbeARHxBxYRJnwlLQ2BmsDHQUQjX\n' +
//     'zwprDcJS8Z/al8+/Nb6rGX9MwgdGLUWJpiAFDXW6e/UHQIDyO3Zg8fzQwf390vXHAQBJCWEltA5+\n' +
//     'KgDVfvPC+4GRcwdOd79PFsmM57EMstPSn9PdgWEoJRbl/uw1bM2bQeJsBvcS6BdPFbc/XHYNF/J5\n' +
//     'e6LnE6X4E0ASgv7DIeufEP5wBpWZ1MpuubVmL9du28Zbt9ZQbe0U2lqzl9PDDv/3oezsTJEiRYoU\n' +
//     'KVKkSJEiRYoUKVKkSJEiRYoUKVKkSJEiRYoUKVKkSJEiRYoUKVKkSJEiRYoUKVKkSHEU/H+SGElB\n' +
//     '+HEYwAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0xMS0wNFQwODoxMjo0NiswMDowMCuy23sAAAAl\n' +
//     'dEVYdGRhdGU6bW9kaWZ5ADIwMjMtMTEtMDRUMDg6MTI6NDYrMDA6MDBa72PHAAAAKHRFWHRkYXRl\n' +
//     'OnRpbWVzdGFtcAAyMDIzLTExLTA0VDA4OjEyOjQ2KzAwOjAwDfpCGAAAABJ0RVh0dGlmZjpDb21w\n' +
//     'cmVzc2lvbgAx2VmtcwAAACB0RVh0dGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uADIjwjCQ\n' +
//     'AAAAAElFTkSuQmCC" />\n' +
//     '</svg>'
//
// const MySQLFill: IconDefinition = {
//     name: 'mysql',
//     theme: 'fill',
//     icon: mysql_icon
// }
//
// const MySQLOutline: IconDefinition = {
//     name: 'mysql',
//     theme: 'outline',
//     icon: '<svg t="1699091748788" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4182" width="200" height="200"><path d="M1001.632 793.792c-7.84-13.856-26.016-37.536-93.12-83.2a1096.224 1096.224 0 0 0-125.152-74.144c-30.592-82.784-89.824-190.112-176.256-319.36-93.056-139.168-201.12-197.792-321.888-174.56a756.608 756.608 0 0 0-40.928-37.696C213.824 78.688 139.2 56.48 96.32 60.736c-19.424 1.952-34.016 9.056-43.36 21.088-21.664 27.904-14.432 68.064 85.504 198.912 19.008 55.616 23.072 84.672 23.072 99.296 0 30.912 15.968 66.368 49.984 110.752l-32 109.504c-28.544 97.792 23.328 224.288 71.616 268.384 25.76 23.552 47.456 20.032 58.176 15.84 21.504-8.448 38.848-29.472 50.048-89.504a4390.107 4390.107 0 0 1 18.208 45.6c34.56 87.744 68.352 136.288 106.336 152.736a32.032 32.032 0 0 0 25.44-58.688c-9.408-4.096-35.328-23.712-72.288-117.504-31.168-79.136-53.856-132.064-69.376-161.856a32.224 32.224 0 0 0-35.328-16.48 32.032 32.032 0 0 0-25.024 29.92c-3.872 91.04-13.056 130.4-19.2 147.008C261.632 785.28 220 689.76 240.896 618.208c20.768-71.232 32.992-112.928 36.64-125.248a31.936 31.936 0 0 0-5.888-29.28c-41.664-51.168-46.176-75.584-46.176-83.712 0-29.472-9.248-70.4-28.288-125.152a31.104 31.104 0 0 0-4.768-8.896c-53.824-70.112-73.6-105.216-80.832-121.888 25.632 1.216 74.336 15.04 91.008 29.376a660.8 660.8 0 0 1 49.024 46.304 31.902 31.902 0 0 0 31.232 8.928c100.192-25.92 188.928 21.152 271.072 144 87.808 131.328 146.144 238.048 173.408 317.216a32 32 0 0 0 16.384 18.432 1004.544 1004.544 0 0 1 128.8 75.264 944.85 944.85 0 0 1 20.064 14.016h-98.848a32.032 32.032 0 0 0-24.352 52.736 3098.752 3098.752 0 0 0 97.856 110.464 32 32 0 1 0 46.56-43.872 2237.6 2237.6 0 0 1-50.08-55.328h110.08a32.032 32.032 0 0 0 27.84-47.776zM320 289.472c12.672 21.76 22.464 37.344 29.344 46.784 8.288 16.256 21.184 29.248 29.44 45.536l2.016-1.984c14.528-9.952 25.92-49.504 2.752-75.488-12.032-18.176-51.04-17.664-63.552-14.848z" fill="#333333" p-id="4183"></path></svg>'
// }
//
// const PostgreSQLOutline: IconDefinition = {
//     name: 'pg',
//     theme: 'outline',
//     icon: ''
// }
//
// const GreenplumOutline: IconDefinition = {
//     name: 'greenplum',
//     theme: 'outline',
//     icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#515151"><path d="M47.202 15.1c-9.35-8.126-23.5-7.258-31.776 1.95S7.76 40.42 16.824 48.865c2.118 1.904 3.915 2.83 5.5 2.83 3.07 0 5.362-3.432 8.325-7.762a68.95 68.95 0 0 1 5.912-7.883 70.88 70.88 0 0 1 7.2-6.703c3.807-3.204 6.797-5.724 6.85-8.553.027-1.716-1.1-3.58-3.42-5.684zM37.3 28.716a36.1 36.1 0 0 0-4.102 3.74 38.3 38.3 0 0 0-3.351 4.558c-1.515 2.292-2.587 3.94-4.022 3.94a2.04 2.04 0 0 1-1.341-.603 11.25 11.25 0 0 1 15.041-16.717 1.96 1.96 0 0 1 .778 1.528c-.08 1.153-1.287 2.158-3.003 3.553zM32.013 0C14.34-.007.007 14.313 0 31.987S14.313 63.993 31.987 64 63.993 49.687 64 32.013A32 32 0 0 0 32.013 0zM52.2 50.152c-10.035 11.136-27.196 12.036-38.34 2-11.258-10-12.33-27.197-2.396-38.505a27.35 27.35 0 0 1 38.491-2.587c11.357 9.877 12.6 27.073 2.78 38.48z"/></svg>'
// }
//
// const OracleOutline: IconDefinition = {
//     name: 'oracle',
//     theme: 'outline',
//     icon: ''
// }
//
// const ElasticSearchOutline: IconDefinition = {
//     name: 'es',
//     theme: 'outline',
//     icon: ''
// }
//
// const TDFSOutline: IconDefinition = {
//     name: 't-dfs',
//     theme: 'fill',
//     icon: ''
// }
// const RocketMQOutline: IconDefinition = {
//     name: 'rocketMq',
//     theme: 'fill',
//     icon: ''
// }
//
// const KafkaOutline: IconDefinition = {
//     name: 'kafka',
//     theme: 'outline',
//     icon: ''
// }
//
// const MongoDBOutline: IconDefinition = {
//     name: 'mongoDB',
//     theme: 'outline',
//     icon: ''
// }
//
// const StarRocksOutline: IconDefinition = {
//     name: 'starRocks',
//     theme: 'fill',
//     icon: '<svg width="54" height="62" viewBox="0 0 54 62" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
//         '<path d="M16.17 27.33C12.17 24.06 7.81 20.45 5.48 18.52L3.85 17.18C2.72 16.25 1.85 14.6 3.75 13.47C4.58 13 18.78 4.83 24 1.8C24.9101 1.26745 25.9455 0.986755 27 0.986755C28.0545 0.986755 29.0899 1.26745 30 1.8L40 7.59C40.1808 7.69315 40.3312 7.8423 40.4357 8.02232C40.5403 8.20234 40.5954 8.40682 40.5954 8.615C40.5954 8.82319 40.5403 9.02767 40.4357 9.20769C40.3312 9.38771 40.1808 9.53686 40 9.64L16.52 23.11C16.1583 23.317 15.8525 23.6089 15.6287 23.9604C15.4049 24.312 15.27 24.7127 15.2356 25.128C15.2011 25.5433 15.2682 25.9607 15.431 26.3443C15.5938 26.7279 15.8474 27.0662 16.17 27.33Z" fill="#FABF00"/>\n' +
//         '<path d="M22 36.88L12.48 51.45C12.1476 51.9565 11.6338 52.3165 11.0443 52.4559C10.4547 52.5954 9.83413 52.5038 9.31 52.2L3 48.55C2.09463 48.0273 1.34153 47.2772 0.815324 46.3738C0.289116 45.4705 0.00805933 44.4454 0 43.4L0 19.08C0.000384234 18.1553 0.216647 17.2435 0.63157 16.4171C1.04649 15.5907 1.64862 14.8726 2.39 14.32C0.69 15.63 1.39 17.1 2.49 18.04L21.57 33.75C22.0121 34.1288 22.3 34.6566 22.3793 35.2334C22.4585 35.8102 22.3236 36.396 22 36.88Z" fill="#338393"/>\n' +
//         '<path d="M37.83 35.11L48.52 43.92L50.15 45.26C51.28 46.2 52.15 47.85 50.25 48.98C49.42 49.47 35.25 57.62 29.98 60.65C29.0739 61.1674 28.0484 61.4395 27.005 61.4395C25.9616 61.4395 24.9362 61.1674 24.03 60.65L14 54.86C13.8194 54.7555 13.6694 54.6053 13.5651 54.4245C13.4609 54.2437 13.406 54.0387 13.406 53.83C13.406 53.6213 13.4609 53.4163 13.5651 53.2355C13.6694 53.0547 13.8194 52.9045 14 52.8L37.48 39.34C37.8417 39.1318 38.1475 38.8389 38.3712 38.4865C38.5948 38.1341 38.7296 37.7327 38.7641 37.3168C38.7985 36.9008 38.7315 36.4827 38.5688 36.0984C38.4061 35.714 38.1526 35.3749 37.83 35.11Z" fill="#338393"/>\n' +
//         '<path d="M32 25.57L41.52 11C41.8524 10.4935 42.3662 10.1336 42.9557 9.99407C43.5453 9.85458 44.1659 9.94617 44.69 10.25L51 13.9C51.9094 14.418 52.6658 15.1671 53.1927 16.0715C53.7195 16.9759 53.998 18.0034 54 19.05V43.37C53.9996 44.2947 53.7833 45.2065 53.3684 46.0329C52.9535 46.8593 52.3514 47.5774 51.61 48.13C53.31 46.82 52.61 45.35 51.51 44.41L32.43 28.69C31.9886 28.3129 31.701 27.7869 31.6218 27.2118C31.5425 26.6367 31.6771 26.0525 32 25.57Z" fill="#338393"/>\n' +
//         '</svg>'
// }
//
// const DorisFill: IconDefinition = {
//     name: 'doris',
//     theme: "fill",
//     icon:
//         '<svg width="250" height="250" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
//         '<g clip-path="url(#clip0_2157_3823)">\n' +
//         '<path d="M143.984 45.0697L118.956 20.0842C115.766 16.8916 111.978 14.3578 107.807 12.6275C103.636 10.8973 99.1639 10.0045 94.6471 10.0001C86.3165 9.97489 78.3048 13.1956 72.3165 18.977C69.1893 21.9906 66.6941 25.5953 64.9762 29.5811C63.2583 33.5668 62.352 37.854 62.3101 42.1929C62.2683 46.5318 63.0917 50.8357 64.7325 54.8537C66.3732 58.8717 68.7984 62.5237 71.8669 65.5968L117.277 110.93C118.241 111.842 119.517 112.349 120.844 112.349C122.171 112.349 123.448 111.842 124.411 110.93L143.954 91.4202C145.183 89.9538 165.625 66.6441 143.984 45.0697Z" fill="#15A9CA"/>\n' +
//         '<path d="M184.988 84.9869C180.222 80.3788 175.276 75.621 170.811 70.4742V70.2947C170.651 70.7628 170.531 71.2432 170.451 71.731C168.576 82.6681 163.202 92.7042 155.134 100.337C128.787 126.46 102.14 153.151 76.3627 178.975L72.8857 182.416C67.5722 187.296 63.9859 193.763 62.6646 200.849C62.1065 205.9 62.6361 211.012 64.2179 215.842C65.7998 220.672 68.3974 225.11 71.8366 228.856C74.7728 232.181 78.4122 234.813 82.4917 236.562C86.5714 238.312 90.9893 239.134 95.4262 238.97C105.707 239.12 110.713 237.773 118.206 230.502C148.18 201.207 178.155 171.673 200.844 149.231C211.545 138.609 214.003 121.014 206.42 109.165C200.252 100.292 193.059 92.1775 184.988 84.9869Z" fill="#52CAA3"/>\n' +
//         '<path d="M39.915 69.3373V179.693C39.9145 180.906 40.2746 182.093 40.9498 183.103C41.6249 184.112 42.5848 184.898 43.7079 185.363C44.831 185.827 46.0669 185.948 47.2591 185.712C48.4515 185.475 49.5466 184.89 50.4059 184.032L106.038 128.495C107.088 127.436 107.678 126.006 107.678 124.515C107.678 123.024 107.088 121.595 106.038 120.535L50.4059 64.9985C49.8472 64.4294 49.1802 63.9775 48.4442 63.6691C47.7082 63.3608 46.9179 63.2024 46.1197 63.2031C44.4844 63.2031 42.9153 63.8474 41.7534 64.9961C40.5915 66.1448 39.9308 67.7049 39.915 69.3373Z" fill="#5268AD"/>\n' +
//         '</g>\n' +
//         '<defs>\n' +
//         '<clipPath id="clip0_2157_3823">\n' +
//         '<rect width="172" height="229" fill="white" transform="translate(39 10)"/>\n' +
//         '</clipPath>\n' +
//         '</defs>\n' +
//         '</svg>'
// };
//
// const ClickhouseOutline: IconDefinition = {
//     name: 'clickhouse',
//     theme: 'outline',
//     icon: '<svg id="Layer_1"  xmlns="http://www.w3.org/2000/svg"  x="0px" y="0px" viewBox="0 0 50.6 50.6" style="enable-background:new 0 0 50.6 50.6;" xml:space="preserve">\n' +
//         ' <metadata>\n' +
//         '  <sfw xmlns="ns_sfw;">\n' +
//         '   <slices>\n' +
//         '   </slices>\n' +
//         '   <sliceSourceBounds bottomLeftOrigin="true" height="50.6" width="50.6" x="0" y="0">\n' +
//         '   </sliceSourceBounds>\n' +
//         '  </sfw>\n' +
//         ' </metadata>\n' +
//         ' <g>\n' +
//         '  <g>\n' +
//         '   <path d="M0.6,0H5c0.3,0,0.6,0.3,0.6,0.6V50c0,0.3-0.3,0.6-0.6,0.6H0.6C0.3,50.6,0,50.4,0,50V0.6C0,0.3,0.3,0,0.6,0z">\n' +
//         '   </path>\n' +
//         '   <path d="M11.8,0h4.4c0.3,0,0.6,0.3,0.6,0.6V50c0,0.3-0.3,0.6-0.6,0.6h-4.4c-0.3,0-0.6-0.3-0.6-0.6V0.6C11.3,0.3,11.5,0,11.8,0z">\n' +
//         '   </path>\n' +
//         '   <path d="M23.1,0h4.4c0.3,0,0.6,0.3,0.6,0.6V50c0,0.3-0.3,0.6-0.6,0.6h-4.4c-0.3,0-0.6-0.3-0.6-0.6V0.6C22.5,0.3,22.8,0,23.1,0z">\n' +
//         '   </path>\n' +
//         '   <path d="M34.3,0h4.4c0.3,0,0.6,0.3,0.6,0.6V50c0,0.3-0.3,0.6-0.6,0.6h-4.4c-0.3,0-0.6-0.3-0.6-0.6V0.6C33.7,0.3,34,0,34.3,0z">\n' +
//         '   </path>\n' +
//         '   <path d="M45.6,19.7H50c0.3,0,0.6,0.3,0.6,0.6v10.1c0,0.3-0.3,0.6-0.6,0.6h-4.4c-0.3,0-0.6-0.3-0.6-0.6V20.3\n' +
//         '\t\t\tC45,20,45.3,19.7,45.6,19.7z">\n' +
//         '   </path>\n' +
//         '  </g>\n' +
//         ' </g>\n' +
//         '</svg>'
// }
//
// const ClickhouseFill: IconDefinition = {
//     name: 'clickhouse',
//     theme: 'fill',
//     icon: ''
// };
//
// export const TISEndtypeIcons: Array<IconDefinition> = [ClickhouseFill, ClickhouseOutline, DorisFill, MongoDBOutline, MySQLFill, MySQLOutline, PostgreSQLOutline, GreenplumOutline, OracleOutline, ElasticSearchOutline, TDFSOutline, RocketMQOutline, KafkaOutline, StarRocksOutline];
//
