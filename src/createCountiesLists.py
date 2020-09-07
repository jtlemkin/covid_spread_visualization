import csv
import json

def formatRow(row):
    return {'id': f'0{row[0]}', 'label': row[4]}

def createCountiesJSON():
    with open('./fips-codes/county_fips_master.csv', newline='', encoding = "ISO-8859-1") as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        countyList = []
        
        for row in reader:
            countyList.append(formatRow(row))

        with open('./counties.json', 'w+') as fp:
            json.dump(countyList[1:], fp)

            
createCountiesJSON()